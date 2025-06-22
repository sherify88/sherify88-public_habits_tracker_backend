#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function getAwsAccountId() {
    try {
        const accountId = execSync('aws sts get-caller-identity --query Account --output text', { encoding: 'utf8' }).trim();
        console.log(`✅ Found AWS Account ID: ${accountId}`);
        return accountId;
    } catch (error) {
        console.error('❌ Error getting AWS Account ID:', error.message);
        console.log('💡 Make sure you have AWS CLI configured and authenticated');
        console.log('   Run: aws configure');
        process.exit(1);
    }
}

async function getAwsRegion() {
    try {
        const region = execSync('aws configure get region', { encoding: 'utf8' }).trim();
        console.log(`✅ Found AWS Region: ${region}`);
        return region;
    } catch (error) {
        console.log('⚠️  Could not get AWS region, using default: us-east-1');
        return 'us-east-1';
    }
}

async function getS3BucketName(accountId) {
    try {
        // Use s3api to get a parsable JSON output, which is more reliable than `s3 ls`
        const command = "aws s3api list-buckets --query \"Buckets[?contains(Name, 'aws-sam-cli-managed-default-samclisourcebucket')].Name | [0]\" --output text";
        const bucketName = execSync(command, { encoding: 'utf8' }).trim();

        if (bucketName && bucketName !== 'None') {
            console.log(`✅ Found existing SAM bucket: ${bucketName}`);
            return bucketName;
        }
    } catch (error) {
        console.log('⚠️  Could not find existing SAM bucket via s3api.');
    }

    // Create default bucket name if none found
    const defaultBucketName = `aws-sam-cli-managed-default-samclisourcebucket-${accountId}`;
    console.log(`📝 No existing SAM bucket found. Using default name: ${defaultBucketName}. SAM will attempt to create it on deploy.`);
    return defaultBucketName;
}

function updateSamConfig(accountId, region, bucketName) {
    const samConfigPath = path.join(process.cwd(), 'samconfig.toml');

    if (!fs.existsSync(samConfigPath)) {
        console.error('❌ samconfig.toml not found in current directory');
        process.exit(1);
    }

    let samConfig = fs.readFileSync(samConfigPath, 'utf8');

    // Replace placeholder values
    samConfig = samConfig.replace(/XXXXXXXXXXXX/g, accountId);
    samConfig = samConfig.replace(/us-east-1/g, region);
    samConfig = samConfig.replace(/aws-sam-cli-managed-default-samclisourcebucket-XXXXXXXXXXXX/g, bucketName);

    fs.writeFileSync(samConfigPath, samConfig);
    console.log(`✅ Updated samconfig.toml with Account ID: ${accountId}, Region: ${region}, Bucket: ${bucketName}`);
}

async function main() {
    console.log('🚀 Setting up SAM configuration...\n');

    const accountId = await getAwsAccountId();
    const region = await getAwsRegion();
    const bucketName = await getS3BucketName(accountId);

    updateSamConfig(accountId, region, bucketName);

    console.log('\n🎉 SAM configuration setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Build your application: npm run build');
    console.log('   2. Deploy to dev: sam build && sam deploy --config-env dev');
    console.log('   3. Deploy to stage: sam build && sam deploy --config-env stage');
    console.log('   4. Deploy to prod: sam build && sam deploy --config-env prod');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { getAwsAccountId, getAwsRegion, getS3BucketName, updateSamConfig }; 