import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { ITokenPayload } from 'src/utils/interfaces';
import { BadRequest } from 'src/utils/enums';

@Injectable()
export class AuthService {
	constructor(
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) { }

	public async validateUser(username: string, plainTextPassword: string): Promise<User | null> {
		try {
			const user = await this.usersService.findByUsername(username);

			if (!user || !user.isActive) {
				return null;
			}

			const isPasswordValid = this.verifyPassword(plainTextPassword, user.password);
			if (!isPasswordValid) {
				return null;
			}

			return user;
		} catch (error) {
			return null;
		}
	}

	private verifyPassword(plainTextPassword: string, hashedPassword: string): boolean {
		return  bcrypt.compareSync(plainTextPassword, hashedPassword);
	}

	async login(user: User) {
		const payload: ITokenPayload = {
			sub: user.id,
			username: user.username
		};

		return {
			id: user.id,
			username: user.username,
			access_token: this.jwtService.sign(payload)
		};
	}

	async validateTokenPayload(payload: ITokenPayload): Promise<User | null> {
		return this.usersService.findById(payload.sub);
	}
}
