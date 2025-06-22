import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ITokenPayload } from 'src/utils/interfaces';
import { SecretsService } from './secrets.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UsersService,
		private readonly secretsService: SecretsService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: !['prod', 'production'].includes(configService.get('NODE_ENV')),
			secretOrKeyProvider: async (request, rawJwtToken, done) => {
				const secretName = process.env.JWT_SECRET_NAME;
				let secret: string;

				if (secretName) {
					secret = await this.secretsService.getSecret(secretName);
				} else {
					secret = this.configService.get<string>('JWT_SECRET', 'default_fallback_secret_for_local_dev');
				}

				done(null, secret);
			},
		});
	}

	async validate(payload: ITokenPayload): Promise<User> {
		const user = await this.userService.findById(payload.sub);
		if (!user || !user.isActive) {
			throw new UnauthorizedException('Invalid token');
		}
		return user;
	}
}
