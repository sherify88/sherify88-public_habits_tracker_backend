import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/auth/allow-guest.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass()
		]);
		if (isPublic) {
			return true;
		}
		const requireRoles = this.reflector.getAllAndOverride('roles', [ context.getHandler(), context.getClass() ]);

		if (!requireRoles) return true;

		const request = context.switchToHttp().getRequest();
		if (!request.user) {
			return false;
		}
		let user = request.user;

	

		return requireRoles.includes(user.role);
	}
}
