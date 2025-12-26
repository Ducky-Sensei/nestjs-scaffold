import { INestApplication, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Product } from '../../src/app/product/product.entity';
import { Permission } from '../../src/app/rbac/entities/permission.entity';
import { Role } from '../../src/app/rbac/entities/role.entity';
import { User } from '../../src/app/user/user.entity';

export async function seedDatabase(app: INestApplication): Promise<void> {
    Logger.log('Seeding database...');

    const dataSource = app.get(DataSource);

    await clearAllTables(dataSource);

    const permissions = await seedPermissions(dataSource);
    const roles = await seedRoles(dataSource, permissions);
    await seedUsers(dataSource, roles);
    await seedProducts(dataSource);

    Logger.log('Database seeding completed');
}

async function clearAllTables(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;
    const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');

    await dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`);
    Logger.log(`Cleared all tables with CASCADE`);
}

async function seedPermissions(dataSource: DataSource): Promise<Permission[]> {
    const permissionRepository = dataSource.getRepository(Permission);

    const permissions = [
        { resource: 'products', action: 'read', description: 'Read products' },
        { resource: 'products', action: 'create', description: 'Create products' },
        { resource: 'products', action: 'update', description: 'Update products' },
        { resource: 'products', action: 'delete', description: 'Delete products' },
        { resource: 'users', action: 'read', description: 'Read users' },
        { resource: 'users', action: 'create', description: 'Create users' },
        { resource: 'users', action: 'update', description: 'Update users' },
        { resource: 'users', action: 'delete', description: 'Delete users' },
    ];

    const saved = await permissionRepository.save(permissions);
    Logger.log(`Seeded ${saved.length} permissions`);
    return saved;
}

async function seedRoles(dataSource: DataSource, permissions: Permission[]): Promise<Role[]> {
    const roleRepository = dataSource.getRepository(Role);

    const adminRole = roleRepository.create({
        name: 'admin',
        description: 'Administrator with full access',
        permissions: permissions,
    });

    const userRole = roleRepository.create({
        name: 'user',
        description: 'Regular user with read access',
        permissions: permissions.filter((p) => p.action === 'read'),
    });

    const moderatorRole = roleRepository.create({
        name: 'moderator',
        description: 'Moderator with read and update access',
        permissions: permissions.filter((p) => ['read', 'update'].includes(p.action)),
    });

    const saved = await roleRepository.save([adminRole, userRole, moderatorRole]);
    Logger.log(`Seeded ${saved.length} roles (admin, user, moderator)`);
    return saved;
}

async function seedUsers(dataSource: DataSource, roles: Role[]): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const hashedPassword = await bcrypt.hash('Foobar1!', 10);

    const adminRole = roles.find((r) => r.name === 'admin')!;
    const userRole = roles.find((r) => r.name === 'user')!;

    const users = [
        {
            email: 'admin@admin.com',
            password: hashedPassword,
            name: 'Admin User',
            isActive: true,
            authProvider: 'password',
            roles: [adminRole],
        },
        {
            email: 'user@user.com',
            password: hashedPassword,
            name: 'Regular User',
            isActive: true,
            authProvider: 'password',
            roles: [userRole],
        },
    ];

    await userRepository.save(users);
    Logger.log(
        `Seeded ${users.length} users (admin@admin.com / user@user.com - password: Foobar1!)`,
    );
}

async function seedProducts(dataSource: DataSource): Promise<void> {
    const productRepository = dataSource.getRepository(Product);

    const products = [
        {
            name: 'Laptop',
            quantity: 10,
            unit: 'piece',
            price: 999.99,
            currency: 'USD',
            isActive: true,
        },
        {
            name: 'Mouse',
            quantity: 50,
            unit: 'piece',
            price: 29.99,
            currency: 'USD',
            isActive: true,
        },
        {
            name: 'Keyboard',
            quantity: 30,
            unit: 'piece',
            price: 79.99,
            currency: 'USD',
            isActive: true,
        },
    ];

    await productRepository.save(products);
    Logger.log(`Seeded ${products.length} products`);
}
