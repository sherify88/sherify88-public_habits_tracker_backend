import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { SecretsModule } from './secrets.module';
import { SecretsService } from './secrets.service';
import JwtAuthGuard from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
	imports: [
		forwardRef(() => UsersModule),
		PassportModule,
		ConfigModule,
		SecretsModule,
		JwtModule.registerAsync({
			imports: [ConfigModule, SecretsModule],
			inject: [ConfigService, SecretsService],
			useFactory: async (
				configService: ConfigService,
				secretsService: SecretsService,
			) => {
				let jwtSecret: string;
				const secretName = process.env.JWT_SECRET_NAME;

				if (secretName) {
					// In AWS environment, fetch from Secrets Manager
					jwtSecret = await secretsService.getSecret(secretName);
				} else {
					// Fallback for local development
					jwtSecret = configService.get<string>('JWT_SECRET', 'default_fallback_secret_for_local_dev');
				}

				return {
					secret: jwtSecret,
					signOptions: {
						expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`
					}
				};
			}
		})
	],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		SecretsService
	],
	controllers: [AuthController],
	exports: [AuthService]
})
export class AuthModule { }
