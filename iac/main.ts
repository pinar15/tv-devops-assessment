import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider, ecr, ecs, iam, vpc, ec2, lb, acm, route53, cloudwatch } from '@cdktf/provider-aws';

class TvAppStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const region = process.env.AWS_REGION || this.node.tryGetContext('awsRegion') || 'us-east-1';
    const prefix = this.node.tryGetContext('resourcePrefix') || 'tv-app';
    const domainName = this.node.tryGetContext('domainName') || 'example.com';

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

    // Security Group
    const sg = new ec2.SecurityGroup(this, 'sg', {
      vpcId: vpcResource.id,
      name: `${prefix}-sg`,
      description: 'Allow HTTP',
      ingress: [
        {
          fromPort: 3000,
          toPort: 3000,
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

    // Route53 Hosted Zone
    const hostedZone = new route53.Route53Zone(this, 'zone', {
      name: domainName,
    });

    // ACM Certificate for HTTPS
    const cert = new acm.AcmCertificate(this, 'cert', {
      domainName: domainName,
      validationMethod: 'DNS',
    });

    // CloudWatch Log Group
    const logGroup = new cloudwatch.CloudwatchLogGroup(this, 'logGroup', {
      name: `/ecs/${prefix}`,
      retentionInDays: 7,
    });

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
      value: sg.id,
    });
    new TerraformOutput(this, 'ecs_cluster_name', {
      value: cluster.name,
    });
    new TerraformOutput(this, 'task_exec_role_arn', {
      value: taskExecRole.arn,
    });
  }
}

const app = new App();
new TvAppStack(app, 'tv-app-stack');
app.synth();
