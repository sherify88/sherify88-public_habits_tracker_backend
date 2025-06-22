import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
var bcrypt = require("bcryptjs");
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

	public async validateUser(phone: string, plainTextPassword: string) {

		try {
			// const user = await this.usersService.findOptions({ isPaginate: false, options: null, FindOptionsWhere: ([{ phone, isDisabled: false, }]), relations: { manager: true, district: true,role:true }, throwException: false, loadEagerRelations: false, loadRelationIds: false, select: { district: { id: true,area_e_nam:true, nameAr: true } } });

			// await this.verifyPassword(plainTextPassword, user.password);
			let user;
			return user;





		} catch (error) {
			throw BadRequest.INVALID_LOGIN();
		}
	}

	private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
		const isPasswordMatching = await bcrypt.compareSync(plainTextPassword, hashedPassword);
		if (!isPasswordMatching) {
			throw BadRequest.INVALID_LOGIN();
		}
	}

	async login(user: User) {
		const payload: ITokenPayload = {
		
		};

		return {
			...payload,
			access_token: this.jwtService.sign(payload)
		};
	}
}
