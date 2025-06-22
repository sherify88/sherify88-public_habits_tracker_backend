#!/bin/bash

# This script creates an IAM role that can be assumed by a GitHub Actions
# workflow to deploy the Habits Tracker application using AWS SAM.

# --- Configuration ---
# !!! IMPORTANT !!!
# !!! Replace 'YOUR_GITHUB_USERNAME_OR_ORG' with your actual GitHub username or organization name. !!!
GITHUB_ORG="YOUR_GITHUB_USERNAME_OR_ORG"
# Your GitHub repository name.
GITHUB_REPO="habits_tracker_backend"
# A descriptive name for the IAM role.
IAM_ROLE_NAME="GitHubActions-HabitsTracker-DeployRole"
# A descriptive name for the IAM policy.
IAM_POLICY_NAME="GitHubActions-HabitsTracker-DeployPolicy"
# The AWS Region where the resources will be deployed.
AWS_REGION="eu-central-1"

# --- Main Script ---

echo "Creating IAM policy: ${IAM_POLICY_NAME}..."

# Create the IAM policy with the minimum required permissions for SAM deployment.
POLICY_ARN=$(aws iam create-policy \
  --policy-name "${IAM_POLICY_NAME}" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "cloudformation:CreateChangeSet",
          "cloudformation:DeleteChangeSet",
          "cloudformation:DescribeChangeSet",
          "cloudformation:DescribeStackEvents",
          "cloudformation:DescribeStacks",
          "cloudformation:ExecuteChangeSet",
          "cloudformation:GetTemplateSummary",
          "cloudformation:ListStackResources",
          "iam:PassRole",
          "iam:CreateRole",
          "iam:GetRole",
          "iam:DeleteRole",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:PutRolePolicy",
          "iam:GetRolePolicy",
          "iam:DeleteRolePolicy",
          "s3:CreateBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "lambda:CreateFunction",
          "lambda:GetFunction",
          "lambda:DeleteFunction",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:AddPermission",
          "lambda:RemovePermission",
          "lambda:ListTags",
          "lambda:TagResource",
          "lambda:UntagResource",
          "apigateway:GET",
          "apigateway:POST",
          "apigateway:PUT",
          "apigateway:DELETE",
          "apigateway:PATCH",
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:DescribeLogGroups",
          "logs:PutRetentionPolicy",
          "secretsmanager:GetSecretValue"
        ],
        "Resource": "*"
      }
    ]
  }' \
  --query 'Policy.Arn' \
  --output text)

if [ $? -ne 0 ]; then
  echo "Error creating IAM policy. Exiting."
  exit 1
fi

echo "Policy created successfully. ARN: ${POLICY_ARN}"
echo "-------------------------------------"

echo "Creating IAM role: ${IAM_ROLE_NAME}..."

# Create the trust relationship document for GitHub's OIDC provider.
# This allows GitHub Actions from the specified repository and branch to assume the role.
TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/master"
        }
      }
    }
  ]
}
EOF
)

# Create the IAM role with the trust policy.
ROLE_ARN=$(aws iam create-role \
  --role-name "${IAM_ROLE_NAME}" \
  --assume-role-policy-document "${TRUST_POLICY}" \
  --query 'Role.Arn' \
  --output text)

if [ $? -ne 0 ]; then
  echo "Error creating IAM role. Exiting."
  exit 1
fi

echo "Role created successfully. ARN: ${ROLE_ARN}"
echo "-------------------------------------"

echo "Attaching policy to the role..."

# Attach the deployment policy to the newly created role.
aws iam attach-role-policy \
  --role-name "${IAM_ROLE_NAME}" \
  --policy-arn "${POLICY_ARN}"

if [ $? -ne 0 ]; then
  echo "Error attaching policy to the role. Exiting."
  exit 1
fi

echo "Policy attached successfully."
echo "-------------------------------------"
echo "IAM Role setup is complete."
echo "Role ARN: ${ROLE_ARN}"
echo "Use this ARN in your GitHub Actions workflow." 