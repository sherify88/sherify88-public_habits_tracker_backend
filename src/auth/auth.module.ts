import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import JwtAuthGuard from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
	imports: [
		forwardRef(() => UsersModule),
		PassportModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
				signOptions: {
					expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`
				}
			})
		})
	],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy
	],
	controllers: [AuthController],
	exports: [AuthService]
})
export class AuthModule { }
