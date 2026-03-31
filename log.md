# Change Log

## [2026-03-28]

### Directory Restructure
- **Action:** Created `app/` directory and moved all application code (app.ts, server.ts, routes/) into it.
- **Reason:** To comply with project requirements for organizing the application code under `app/` for containerization and local development.

### iac/ Directory Initialization
- **Action:** Created `iac/` directory at the project root.
- **Reason:** To organize all infrastructure-as-code (IaC) files for AWS deployment using CDK for Terraform (CDKTF), as required by the project.

### iac/README.md
- **Action:** Added a README.md in `iac/` with setup, deployment, and parameterization instructions.
- **Reason:** To provide clear documentation for infrastructure setup and usage.

### iac/cdktf.json
- **Action:** Added `cdktf.json` with language, app entry, provider, and context defaults.
- **Reason:** To configure CDKTF project and parameterize AWS region and resource prefix.

### iac/package.json
- **Action:** Added `package.json` for IaC dependencies and scripts.
- **Reason:** To manage CDKTF, constructs, and TypeScript dependencies, and provide synth/deploy/destroy scripts.

### iac/tsconfig.json
- **Action:** Added `tsconfig.json` for TypeScript configuration in IaC.
- **Reason:** To enable TypeScript compilation for infrastructure code.

### iac/main.ts
- **Action:** Added `main.ts` with CDKTF stack for ECR, VPC, subnet, IGW, security group, ECS cluster, and IAM role.
- **Reason:** To define the core AWS infrastructure, fully parameterized and ready for extension (e.g., ECS service, load balancer).

### iac/backend.tf.json
- **Action:** Added S3 + DynamoDB remote backend configuration for Terraform state.
- **Reason:** To enable remote state storage and locking for multi-environment and team-safe deployments (bonus point).

### iac/package.json
- **Action:** Added `@cdktf/provider-aws` to dependencies.
- **Reason:** Required for advanced AWS resources (Route53, ACM, CloudWatch, etc.) for bonus features.

### iac/main.ts
- **Action:** Imported and added Route53 hosted zone, ACM certificate for HTTPS, and CloudWatch log group resources.
- **Reason:** To support bonus requirements: DNS/HTTPS, logging, and monitoring.

### package.json & tsconfig.json
- **Action:** Created new `package.json` and `tsconfig.json` inside `app/`.
- **Reason:** To ensure all build, start, and dev scripts, as well as TypeScript configuration, are scoped to the new app/ directory structure.

### .dockerignore
- **Action:** Added `.dockerignore` to `app/`.
- **Reason:** To exclude unnecessary files (node_modules, dist, etc.) from Docker build context, reducing image size and build time.

### Dockerfile
- **Action:** Added production-optimized multi-stage `Dockerfile` to `app/`.
- **Reason:** To build and run the app efficiently in a container, following best practices for Node.js and TypeScript.

### docker-compose.yml
- **Action:** Added `docker-compose.yml` to `app/`.
- **Reason:** To orchestrate the app container for local development, mapping port 3000 and setting environment variables.

### routes/index.ts
- **Action:** Copied routes/index.ts to app/routes/index.ts.
- **Reason:** To preserve routing functionality after restructuring.

### app.ts & server.ts
- **Action:** Copied app.ts and server.ts to app/.
- **Reason:** To maintain application entry points after restructuring.

### routes/index.ts
- **Action:** Added `/health` endpoint to the Express router.
- **Reason:** To fulfill Part 1 of the requirements: "App must respond to http://localhost:3000/health" for Docker Compose local development.

## [LOGGING POLICY UPDATE - 2026-03-28]
- **Action:** Updated logging policy for log.md.
- **Reason:** All new changes must be appended to the end of log.md, preserving the full sequence of actions and reasons for traceability.

## [2026-03-28]

### .github/workflows/ci-cd.yml
- **Action:** Added GitHub Actions workflow for CI/CD automation.
- **Reason:** To build, tag, and push Docker images to ECR and deploy infrastructure with CDKTF on every push to main, fulfilling Part 3 requirements.

### README.md
- **Action:** Added CI/CD badge and documentation for GitHub Actions workflow and secrets.
- **Reason:** To provide visibility into pipeline status and clear setup instructions for CI/CD and secrets management.

---

All changes above are required to meet the Dockerization and local dev environment requirements in the README.
