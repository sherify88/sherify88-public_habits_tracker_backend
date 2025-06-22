import { Injectable, Logger } from '@nestjs/common';
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsService {
    private readonly logger = new Logger(SecretsService.name);
    private cachedSecrets: Record<string, string> = {};

    async getSecret(secretName: string): Promise<string> {
        // Return from cache if available
        if (this.cachedSecrets[secretName]) {
            this.logger.log(`Returning cached secret for: ${secretName}`);
            return this.cachedSecrets[secretName];
        }

        this.logger.log(`Fetching secret from AWS Secrets Manager: ${secretName}`);

        try {
            const client = new SecretsManagerClient({
                region: process.env.AWS_REGION || 'eu-central-1',
            });

            const command = new GetSecretValueCommand({ SecretId: secretName });
            const response = await client.send(command);

            if (response.SecretString) {
                this.cachedSecrets[secretName] = response.SecretString;
                return response.SecretString;
            } else {
                // Handle binary secrets if needed, though not expected for JWT
                const buff = Buffer.from(response.SecretBinary as Uint8Array);
                const secret = buff.toString('ascii');
                this.cachedSecrets[secretName] = secret;
                return secret;
            }
        } catch (error) {
            this.logger.error(`Failed to fetch secret: ${secretName}`, error);
            // Fallback for local development if the secret is not in AWS
            if (process.env.NODE_ENV !== 'production') {
                this.logger.warn('Falling back to default JWT_SECRET for local development.');
                return 'default_fallback_secret_for_local_dev';
            }
            throw new Error(`Could not fetch required secret: ${secretName}`);
        }
    }
} 