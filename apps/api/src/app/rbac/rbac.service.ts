import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { User } from '../user/user.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RbacService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) {}

    async createRole(name: string, description?: string): Promise<Role> {
        const role = this.roleRepository.create({ name, description });
        return this.roleRepository.save(role);
    }

    async createPermission(
        resource: string,
        action: string,
        description?: string,
    ): Promise<Permission> {
        const permission = this.permissionRepository.create({ resource, action, description });
        return this.permissionRepository.save(permission);
    }

    async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: ['permissions'],
        });

        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }

        const permissions = await this.permissionRepository.findByIds(permissionIds);
        role.permissions = permissions;

        return this.roleRepository.save(role);
    }

    async findRoleByName(name: string): Promise<Role | null> {
        return this.roleRepository.findOne({ where: { name } });
    }

    async findPermission(resource: string, action: string): Promise<Permission | null> {
        return this.permissionRepository.findOne({ where: { resource, action } });
    }

    async userHasRole(user: User, roleName: string): Promise<boolean> {
        if (!user.roles) {
            return false;
        }
        return user.roles.some((role) => role.name === roleName);
    }

    async userHasPermission(user: User, permissionName: string): Promise<boolean> {
        if (!user.roles) {
            return false;
        }

        const [resource, action] = permissionName.split(':');
        if (!resource || !action) {
            return false;
        }

        return user.roles.some((role) =>
            role.permissions.some((p) => p.resource === resource && p.action === action),
        );
    }

    async userHasAnyRole(user: User, roleNames: string[]): Promise<boolean> {
        if (!user.roles) {
            return false;
        }
        return user.roles.some((role) => roleNames.includes(role.name));
    }

    async userHasAllPermissions(user: User, permissionNames: string[]): Promise<boolean> {
        const checks = await Promise.all(
            permissionNames.map((permission) => this.userHasPermission(user, permission)),
        );
        return checks.every((check) => check);
    }
}
