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