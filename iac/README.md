# Infrastructure as Code (IaC) - CDK for Terraform

This directory contains the infrastructure code for deploying the application to AWS using CDK for Terraform (CDKTF) in TypeScript.

## Prerequisites
- Node.js and npm
- AWS CLI configured (or environment variables for credentials)
- cdktf CLI installed globally (`npm install -g cdktf`)

## Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Configure AWS credentials (via environment variables or AWS CLI profile).
3. Update `cdktf.json` or `.env` as needed for your environment.

## Commands
- `cdktf synth` – Synthesize Terraform JSON from CDK code
- `cdktf deploy` – Deploy the stack to AWS
- `cdktf destroy` – Destroy the stack

## Parameterization
- All AWS account, region, and resource names are parameterized via `cdktf.json` and environment variables.

## Output
- The deployed service will expose a public `/health` endpoint.

---

See the main README for more details and CI/CD integration.
