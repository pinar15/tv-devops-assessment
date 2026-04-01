import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider, ecr, ecs, iam, vpc, ec2, lb, acm, route53, cloudwatch } from '@cdktf/provider-aws';

class TvAppStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const region = process.env.AWS_REGION || this.node.tryGetContext('awsRegion') || 'us-east-1';
    const prefix = process.env.RESOURCE_PREFIX || this.node.tryGetContext('resourcePrefix') || 'tv-app';
    const domainName = process.env.DOMAIN_NAME || this.node.tryGetContext('domainName') || 'example.com';

    new AwsProvider(this, 'aws', {
      region,
    });

    // ECR Repository
    const repository = new ecr.EcrRepository(this, 'ecr', {
      name: `${prefix}-repo`,
    });

    // VPC
    const vpcResource = new vpc.Vpc(this, 'vpc', {
      cidrBlock: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Public Subnet
    const subnet = new ec2.Subnet(this, 'subnet', {
      vpcId: vpcResource.id,
      cidrBlock: '10.0.1.0/24',
      mapPublicIpOnLaunch: true,
      availabilityZone: `${region}a`,
    });

    // Internet Gateway
    const igw = new ec2.InternetGateway(this, 'igw', {
      vpcId: vpcResource.id,
    });

    // Route Table
    const routeTable = new ec2.RouteTable(this, 'routeTable', {
      vpcId: vpcResource.id,
      route: [
        {
          cidrBlock: '0.0.0.0/0',
          gatewayId: igw.id,
        },
      ],
    });

    // Route Table Association
    new ec2.RouteTableAssociation(this, 'routeTableAssoc', {
      subnetId: subnet.id,
      routeTableId: routeTable.id,
    });

    // ALB Security Group
    const albSg = new ec2.SecurityGroup(this, 'albSg', {
      vpcId: vpcResource.id,
      name: `${prefix}-alb-sg`,
      description: 'Allow HTTP/HTTPS',
      ingress: [
        {
          fromPort: 80,
          toPort: 80,
          protocol: 'tcp',
          cidrBlocks: ['0.0.0.0/0'],
        },
        {
          fromPort: 443,
          toPort: 443,
          protocol: 'tcp',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
    });

    // ECS Security Group
    const ecsSg = new ec2.SecurityGroup(this, 'ecsSg', {
      vpcId: vpcResource.id,
      name: `${prefix}-ecs-sg`,
      description: 'Allow traffic from ALB',
      ingress: [
        {
          fromPort: 3000,
          toPort: 3000,
          protocol: 'tcp',
          securityGroups: [albSg.id],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
    });

    // ECS Cluster
    const cluster = new ecs.EcsCluster(this, 'cluster', {
      name: `${prefix}-cluster`,
    });

    // IAM Role for ECS Task Execution
    const taskExecRole = new iam.IamRole(this, 'taskExecRole', {
      name: `${prefix}-ecsTaskExecutionRole`,
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'ecs-tasks.amazonaws.com' },
            Action: 'sts:AssumeRole',
          },
        ],
      }),
      managedPolicyArns: [
        'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      ],
    });

    // Route53 Hosted Zone (only if custom domain)
    let hostedZone: route53.Route53Zone | undefined;
    let cert: acm.AcmCertificate | undefined;

    if (domainName !== 'example.com' && domainName) {
      hostedZone = new route53.Route53Zone(this, 'zone', {
        name: domainName,
      });

      // ACM Certificate for HTTPS
      cert = new acm.AcmCertificate(this, 'cert', {
        domainName: domainName,
        validationMethod: 'DNS',
      });

      // Certificate Validation Records
      cert.domainValidationOptions.forEach((option, index) => {
        new route53.Route53Record(this, `certValidationRecord${index}`, {
          zoneId: hostedZone.zoneId,
          name: option.resourceRecordName,
          type: option.resourceRecordType,
          records: [option.resourceRecordValue],
          ttl: 300,
        });
      });

      // Certificate Validation
      new acm.AcmCertificateValidation(this, 'certValidation', {
        certificateArn: cert.arn,
      });
    }

    // CloudWatch Log Group
    const logGroup = new cloudwatch.CloudwatchLogGroup(this, 'logGroup', {
      name: `/ecs/${prefix}`,
      retentionInDays: 7,
    });

    // Application Load Balancer
    const alb = new lb.Lb(this, 'alb', {
      name: `${prefix}-alb`,
      internal: false,
      loadBalancerType: 'application',
      securityGroups: [albSg.id],
      subnets: [subnet.id],
    });

    // Target Group
    const targetGroup = new lb.LbTargetGroup(this, 'targetGroup', {
      name: `${prefix}-tg`,
      port: 3000,
      protocol: 'HTTP',
      vpcId: vpcResource.id,
      targetType: 'ip',
      healthCheck: {
        enabled: true,
        path: '/health',
        port: '3000',
        protocol: 'HTTP',
        healthyThreshold: 2,
        unhealthyThreshold: 2,
        timeout: 5,
        interval: 30,
      },
    });

    // Listeners
    if (cert) {
      // HTTPS Listener
      new lb.LbListener(this, 'listener', {
        loadBalancerArn: alb.arn,
        port: 443,
        protocol: 'HTTPS',
        sslPolicy: 'ELBSecurityPolicy-2016-08',
        certificateArn: cert.arn,
        defaultAction: [
          {
            type: 'forward',
            targetGroupArn: targetGroup.arn,
          },
        ],
      });

      // HTTP to HTTPS Redirect
      new lb.LbListener(this, 'httpListener', {
        loadBalancerArn: alb.arn,
        port: 80,
        protocol: 'HTTP',
        defaultAction: [
          {
            type: 'redirect',
            redirect: {
              port: '443',
              protocol: 'HTTPS',
              statusCode: 'HTTP_301',
            },
          },
        ],
      });
    } else {
      // HTTP Listener
      new lb.LbListener(this, 'httpListener', {
        loadBalancerArn: alb.arn,
        port: 80,
        protocol: 'HTTP',
        defaultAction: [
          {
            type: 'forward',
            targetGroupArn: targetGroup.arn,
          },
        ],
      });
    }

    // ECS Task Definition
    const taskDefinition = new ecs.EcsTaskDefinition(this, 'taskDef', {
      family: `${prefix}-task`,
      cpu: '256',
      memory: '512',
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      executionRoleArn: taskExecRole.arn,
      containerDefinitions: JSON.stringify([
        {
          name: 'app',
          image: `${repository.repositoryUrl}:latest`,
          essential: true,
          portMappings: [
            {
              containerPort: 3000,
              hostPort: 3000,
              protocol: 'tcp',
            },
          ],
          environment: [
            {
              name: 'NODE_ENV',
              value: 'production',
            },
            {
              name: 'PORT',
              value: '3000',
            },
          ],
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              'awslogs-group': logGroup.name,
              'awslogs-region': region,
              'awslogs-stream-prefix': 'ecs',
            },
          },
        },
      ]),
    });

    // ECS Service
    const service = new ecs.EcsService(this, 'service', {
      name: `${prefix}-service`,
      cluster: cluster.id,
      taskDefinition: taskDefinition.arn,
      desiredCount: 1,
      launchType: 'FARGATE',
      networkConfiguration: {
        subnets: [subnet.id],
        securityGroups: [ecsSg.id],
        assignPublicIp: true,
      },
      loadBalancer: [
        {
          targetGroupArn: targetGroup.arn,
          containerName: 'app',
          containerPort: 3000,
        },
      ],
    });

    // Route53 Record (only if custom domain)
    if (hostedZone) {
      new route53.Route53Record(this, 'record', {
        zoneId: hostedZone.zoneId,
        name: domainName,
        type: 'A',
        alias: {
          name: alb.dnsName,
          zoneId: alb.zoneId,
          evaluateTargetHealth: true,
        },
      });
    }

    // Outputs
    new TerraformOutput(this, 'ecr_repo_url', {
      value: repository.repositoryUrl,
    });
    new TerraformOutput(this, 'vpc_id', {
      value: vpcResource.id,
    });
    new TerraformOutput(this, 'subnet_id', {
      value: subnet.id,
    });
    new TerraformOutput(this, 'security_group_id', {
      value: ecsSg.id,
    });
    new TerraformOutput(this, 'ecs_cluster_name', {
      value: cluster.name,
    });
    new TerraformOutput(this, 'task_exec_role_arn', {
      value: taskExecRole.arn,
    });
    new TerraformOutput(this, 'alb_dns_name', {
      value: alb.dnsName,
    });
    new TerraformOutput(this, 'app_url', {
      value: hostedZone ? `https://${domainName}` : `http://${alb.dnsName}`,
    });
  }
}

const app = new App();
new TvAppStack(app, 'tv-app-stack');
app.synth();
