import { SetMetadata } from '@nestjs/common';
import { Roles_En } from './interfaces';

export const Roles = (roles: Roles_En[]) => {
    return SetMetadata('roles', roles);
};
