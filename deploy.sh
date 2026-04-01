#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found in the root directory"
    echo "Please copy .env.example to .env and update with your AWS credentials"
    exit 1
fi

# Verify AWS credentials are set
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: AWS credentials not set in .env file"
    echo "Please update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env"
    exit 1
fi

# Set default region if not provided
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "✓ AWS credentials loaded from .env"
echo "✓ AWS Region: $AWS_DEFAULT_REGION"
echo ""

# Navigate to iac directory
cd iac

# Install dependencies
echo "Installing dependencies..."
npm install

# Deploy with CDKTF
echo ""
echo "Deploying infrastructure..."
cdktf deploy --auto-approve

# Show outputs
echo ""
echo "✓ Deployment complete!"
echo "Check the outputs above for your application URL."
