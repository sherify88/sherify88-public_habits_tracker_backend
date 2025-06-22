import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ITokenPayload } from 'src/utils/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService, private readonly userService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: !['prod', 'production'].includes(configService.get('NODE_ENV')),
			secretOrKey: configService.get('JWT_SECRET')
		});
	}

	async validate(payload: ITokenPayload) {
		return payload;
	}
}
