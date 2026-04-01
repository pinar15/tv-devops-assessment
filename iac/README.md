# Infrastructure as Code (IaC) - CDK for Terraform

This directory contains the infrastructure code for deploying the application to AWS using CDK for Terraform (CDKTF) in TypeScript.

## Prerequisites
- Node.js 18+ and npm
- AWS account with appropriate IAM permissions
- AWS CLI installed (optional, or use `.env` file instead)
- cdktf CLI installed globally (`npm install -g cdktf`)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AWS Credentials

Choose one of the following methods:

**Option A: Using .env file (Recommended)**
```bash
# From repository root
export $(cat .env | grep -v '^#' | xargs)
```

**Option B: AWS CLI**
```bash
aws configure
# Then enter your credentials when prompted
```

**Option C: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Optional: Configure Parameters

Edit the `.env` file in the repository root to customize:
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=us-east-1
RESOURCE_PREFIX=tv-app
DOMAIN_NAME=optional-domain.com
```

## AWS Infrastructure

The IaC creates the following AWS resources:

### Compute
- **ECS Cluster** (Fargate launch type for serverless containers)
- **ECS Task Definition** (defines container specification and resource limits)
- **ECS Service** (manages running tasks with auto-scaling)

### Networking
- **VPC** (isolated network environment)
- **Public Subnet** (accessible from internet)
- **Internet Gateway** (enables internet connectivity)
- **Application Load Balancer** (routes HTTP/HTTPS traffic)
- **Security Groups** (ALB and ECS with proper ingress/egress rules)

### Storage & Logging
- **ECR Repository** (stores Docker container images)
- **CloudWatch Log Group** (application logs and monitoring)

### DNS & SSL
- **Route53 Zone** (optional, if custom domain is provided)
- **ACM Certificate** (SSL/TLS certificate for HTTPS)
- **DNS Records** (points domain to load balancer)

## Deployment

### Using Automated Deploy Script (Recommended)

From the repository root:
```bash
# macOS/Linux
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

### Manual Deployment

```bash
# Load environment from .env
export $(cat .env | grep -v '^#' | xargs)

# Deploy to AWS
cdktf deploy --auto-approve
```

## Commands

### Deploy Infrastructure
```bash
cdktf deploy --auto-approve
```

### Preview Changes
```bash
cdktf plan
```

### Synthesize Terraform
```bash
cdktf synth
```

### Destroy Infrastructure
```bash
cdktf destroy --auto-approve
```
⚠️ **Warning:** This will delete all AWS resources created by this stack.

## Parameterization

Configuration can be set via environment variables (read from `.env` file):

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | Required | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Required | AWS secret key |
| `AWS_DEFAULT_REGION` | us-east-1 | AWS region for deployment |
| `RESOURCE_PREFIX` | tv-app | Prefix for all AWS resource names |
| `DOMAIN_NAME` | example.com | Custom domain (optional; if not set, ALB DNS is used) |

## Outputs

After successful deployment, the stack outputs:
- **alb_dns_name**: Public DNS name of the load balancer
- **app_url**: URL to access the application (HTTPS if custom domain, HTTP if ALB DNS)
- **ecr_repo_url**: ECR repository URL for pushing container images
- **ecs_cluster_name**: ECS cluster name
- **Other resource IDs**: VPC, subnet, security groups, IAM role ARNs

## Monitoring

### CloudWatch Logs
View application logs:
```bash
aws logs tail /ecs/tv-app --follow
```

### Health Check
Once deployed, verify the application is healthy:
```bash
curl https://your-domain.com/health
# or
curl http://[alb-dns-name]/health
```

## Cost Management

⚠️ **AWS Charges Apply**
This deployment incurs AWS costs (~$20-50/month depending on usage):
- Load Balancer: ~$16/month
- ECS Fargate Tasks: ~$5-30/month
- Data Transfer: Additional costs may apply

To minimize costs:
- Set `desiredCount: 1` in ECS Service (only 1 running task)
- Use smallest task CPU/memory (256 CPU, 512 MB memory)

To stop charges immediately:
```bash
cdktf destroy --auto-approve
```

## CI/CD Integration

The GitHub Actions workflow in `.github/workflows/ci-cd.yml`:
1. Builds Docker image on push to `main`
2. Pushes to ECR
3. Automatically runs `cdktf deploy --auto-approve`

Ensure GitHub repository secrets are configured:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPO`

## Troubleshooting

### Deployment Fails: "Unable to assume role"
**Solution:** Verify AWS credentials are correct and have sufficient IAM permissions.

### Application not accessible
**Solution:** Check load balancer target group health check status in AWS console.

### DNS not resolving
**Solution:** Ensure Route53 hosted zone exists and nameservers are properly configured if using custom domain.

### View detailed logs
```bash
cdktf deploy --log-level debug
```

---

See [../app/README.md](../app/README.md) for application code and local development setup.
