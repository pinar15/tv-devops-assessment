# Application Code

This directory contains the Express.js + TypeScript application code, containerization setup, and local development environment.

## Local Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Running Locally with Docker Compose

1. Navigate to the `app/` directory:
   ```
   cd app
   ```

2. Build and run the application:
   ```
   docker-compose up --build
   ```

3. The application will be available at:
   - Main app: http://localhost:3000
   - Health check: http://localhost:3000/health

4. To stop the application:
   ```
   docker-compose down
   ```

### Running Locally with npm (Development Mode)

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. The application will be available at http://localhost:3000

### Building for Production

1. Build the TypeScript code:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## CI/CD

The CI/CD pipeline is configured via GitHub Actions. The workflow file is located at `.github/workflows/ci-cd.yml` in the repository root.

### Workflow Overview
- Triggers on push to `main` branch
- Builds the Docker image
- Pushes to Amazon ECR
- Deploys infrastructure using CDK for Terraform

### Required Secrets
Set the following secrets in your GitHub repository settings:
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `ECR_REPO`: ECR repository URL

## AWS Deployment

### Prerequisites
- AWS account with appropriate permissions
- AWS CLI configured (or use `.env` file)
- Node.js 18+ installed
- cdktf CLI: `npm install -g cdktf`

### Setup AWS Credentials

1. **Option A: Using .env file (Recommended)**
   - Copy `.env.example` to `.env` in the root directory
   - Update with your AWS credentials:
     ```env
     AWS_ACCESS_KEY_ID=your-access-key-id
     AWS_SECRET_ACCESS_KEY=your-secret-access-key
     AWS_DEFAULT_REGION=us-east-1
     RESOURCE_PREFIX=tv-app
     DOMAIN_NAME=optional-domain.com
     ```

2. **Option B: Using AWS CLI**
   ```bash
   aws configure
   ```

3. **Option C: Using Environment Variables**
   ```bash
   export AWS_ACCESS_KEY_ID=your-access-key
   export AWS_SECRET_ACCESS_KEY=your-secret-key
   export AWS_DEFAULT_REGION=us-east-1
   ```

### Deploy to AWS

**Using the automated deploy script (Recommended):**

From the repository root:

```bash
# macOS/Linux
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

**Or manually:**

```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Navigate and deploy
cd iac
npm install
cdktf deploy --auto-approve
```

### After Deployment

Once deployment completes, you will receive outputs including:
- **ALB DNS Name**: The public load balancer DNS (if no custom domain)
- **App URL**: The accessible application URL
- **Health Check**: `/health` endpoint for monitoring

Access your application:
```
http://[alb-dns-name]
http://[alb-dns-name]/health
```

Or with a custom domain:
```
https://your-domain.com
https://your-domain.com/health
```

### Important Notes

- ⚠️ **Never commit `.env` file** - it contains sensitive credentials
- `.env` is already in `.gitignore` for security
- Share `.env.example` with team members; they add their own credentials
- Deployment costs apply (~$20-50/month in AWS)
- To destroy infrastructure: `cd iac && cdktf destroy --auto-approve`

## File Structure

- `app.ts`: Main Express application setup
- `server.ts`: Server entry point
- `routes/index.ts`: API routes including health check
- `Dockerfile`: Multi-stage Docker build for production
- `docker-compose.yml`: Local development orchestration
- `package.json`: Node.js dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `.dockerignore`: Files to exclude from Docker build context</content>
<parameter name="filePath">vscode-vfs://github/pinar15/tv-devops-assessment/app/README.md