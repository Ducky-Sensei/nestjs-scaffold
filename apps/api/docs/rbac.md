# Role-Based Access Control (RBAC)

This application implements a comprehensive Role-Based Access Control (RBAC) system that supports both role-based and permission-based authorization. The system is production-ready, flexible, and follows NestJS best practices.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [API Examples](#api-examples)
- [Advanced Topics](#advanced-topics)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Features

- **Role-Based Authorization**: Control access based on user roles (admin, user, moderator)
- **Permission-Based Authorization**: Fine-grained control with specific permissions (products:read, products:write)
- **JWT Integration**: Roles and permissions embedded in JWT tokens for stateless auth
- **Flexible Guards**: Use roles, permissions, or both for access control
- **Type-Safe**: Full TypeScript support with proper interfaces
- **Eager Loading**: Roles and permissions loaded automatically with users
- **Seeded Data**: Default roles and permissions for immediate use

### RBAC Hierarchy

```
User
  └── Roles (Many-to-Many)
       └── Permissions (Many-to-Many)
```

A user can have multiple roles, and each role can have multiple permissions.

---

## Architecture

### Entities

**Location**: `src/app/rbac/entities/`

#### User Entity
```typescript
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable({ name: 'user_roles' })
    roles: Role[];
}
```

#### Role Entity
```typescript
@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
    @JoinTable({ name: 'role_permissions' })
    permissions: Permission[];

    @ManyToMany('User', 'roles')
    users: User[];
}
```

#### Permission Entity
```typescript
@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    resource: string;

    @Column()
    action: string;

    @Column({ nullable: true })
    description: string;

    get name(): string {
        return `${this.resource}:${this.action}`;
    }
}
```

### Decorators

**Location**: `src/app/rbac/decorators/`

#### @Roles
```typescript
@Roles('admin', 'moderator')
@Get()
findAll() {
    // Only admin and moderator can access
}
```

#### @RequirePermissions
```typescript
@RequirePermissions('products:create')
@Post()
create() {
    // Only users with products:create permission
}
```

### Guards

**Location**: `src/app/rbac/guards/`

#### RolesGuard
Checks if the user has any of the required roles.

#### PermissionsGuard
Checks if the user has ALL required permissions.

Both guards read from JWT payload, making authorization stateless and fast.

---

## Database Schema

### Tables

**users**
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `name` (VARCHAR, NULL)
- `isActive` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**roles**
- `id` (UUID, PK)
- `name` (VARCHAR, UNIQUE) - e.g., "admin", "user", "moderator"
- `description` (VARCHAR, NULL)
- `isActive` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**permissions**
- `id` (UUID, PK)
- `resource` (VARCHAR) - e.g., "products", "users"
- `action` (VARCHAR) - e.g., "read", "create", "update", "delete"
- `description` (VARCHAR, NULL)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)
- UNIQUE INDEX on `(resource, action)`

**user_roles** (Junction Table)
- `userId` (UUID, FK → users.id, CASCADE)
- `roleId` (UUID, FK → roles.id, CASCADE)
- Composite PK: `(userId, roleId)`

**role_permissions** (Junction Table)
- `roleId` (UUID, FK → roles.id, CASCADE)
- `permissionId` (UUID, FK → permissions.id, CASCADE)
- Composite PK: `(roleId, permissionId)`

### Migrations

All tables are created in a single migration:

**Location**: `src/migrations/1734000000000-Init.ts`

Run migrations:
```bash
pnpm migration:run
```

---

## Quick Start

### Default Roles and Permissions

The seed data creates three roles with different permission sets:

**admin** - Full access
- All permissions: `products:*`, `users:*`

**moderator** - Read and update access
- Permissions: `products:read`, `products:update`, `users:read`, `users:update`

**user** - Read-only access
- Permissions: `products:read`, `users:read`

### Default Users

**Location**: `dev/test-data/seed.ts`

| Email | Password | Role |
|-------|----------|------|
| admin@admin.com | Foobar1! | admin |
| user@user.com | Foobar1! | user |

### Enable Seeding

```bash
# .env
SEED_DATABASE=true
```

Start the application:
```bash
docker compose -f docker-compose.dev.yml up
```

The database will be seeded automatically with roles, permissions, and users.

---

## Usage Guide

### Protecting Endpoints with Roles

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../rbac/decorators';
import { RolesGuard } from '../rbac/guards';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
    @Roles('admin')
    @Get('dashboard')
    getDashboard() {
        return { message: 'Admin dashboard' };
    }

    @Roles('admin', 'moderator')
    @Get('reports')
    getReports() {
        return { message: 'Reports accessible by admin and moderator' };
    }
}
```

### Protecting Endpoints with Permissions

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../rbac/decorators';
import { PermissionsGuard } from '../rbac/guards';

@Controller('products')
@UseGuards(PermissionsGuard)
export class ProductController {
    @RequirePermissions('products:create')
    @Post()
    create() {
        return { message: 'Product created' };
    }

    @RequirePermissions('products:update', 'products:delete')
    @Delete(':id')
    delete() {
        // User must have BOTH update AND delete permissions
    }
}
```

### Combining Roles and Permissions

```typescript
@Controller('products')
@UseGuards(RolesGuard, PermissionsGuard)
export class ProductController {
    @Roles('admin', 'moderator')
    @RequirePermissions('products:update')
    @Put(':id')
    update() {
        // User must:
        // 1. Have 'admin' OR 'moderator' role
        // 2. AND have 'products:update' permission
    }
}
```

### Using RBAC Service

```typescript
import { Injectable } from '@nestjs/common';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class UserService {
    constructor(private rbacService: RbacService) {}

    async canUserAccessResource(user: User, resource: string): Promise<boolean> {
        return this.rbacService.userHasPermission(user, `${resource}:read`);
    }

    async isAdmin(user: User): Promise<boolean> {
        return this.rbacService.userHasRole(user, 'admin');
    }
}
```

---

## API Examples

### Login and Get Token

```bash
POST /v1/auth/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "Foobar1!"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@admin.com",
    "name": "Admin User"
  }
}
```

The JWT payload includes roles and permissions:
```json
{
  "sub": "user-uuid",
  "email": "admin@admin.com",
  "roles": [
    {
      "id": "role-uuid",
      "name": "admin",
      "permissions": [
        { "resource": "products", "action": "read" },
        { "resource": "products", "action": "create" },
        { "resource": "products", "action": "update" },
        { "resource": "products", "action": "delete" }
      ]
    }
  ]
}
```

### Access Protected Endpoint

```bash
GET /v1/products
Authorization: Bearer <token>
```

**Success (user has `products:read` permission)**:
```json
[
  {
    "id": 1,
    "name": "Laptop",
    "quantity": 10,
    "price": 999.99
  }
]
```

**Forbidden (user lacks permission)**:
```json
{
  "statusCode": 403,
  "message": "User requires the following permissions: products:read",
  "error": "Forbidden"
}
```

### Create Product (Admin Only)

```bash
POST /v1/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Mouse",
  "quantity": 50,
  "unit": "piece",
  "price": 29.99,
  "currency": "USD"
}
```

**Success (admin or moderator)**:
```json
{
  "id": 4,
  "name": "Mouse",
  "quantity": 50,
  "price": 29.99,
  "isActive": true
}
```

**Forbidden (regular user)**:
```json
{
  "statusCode": 403,
  "message": "User requires one of the following roles: admin, moderator",
  "error": "Forbidden"
}
```

### Delete Product (Admin Only)

```bash
DELETE /v1/products/1
Authorization: Bearer <admin-token>
```

**Success (admin only)**:
```
204 No Content
```

**Forbidden (moderator or user)**:
```json
{
  "statusCode": 403,
  "message": "User requires one of the following roles: admin",
  "error": "Forbidden"
}
```

---

## Advanced Topics

### Creating Custom Roles

```typescript
import { Injectable } from '@nestjs/common';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class AdminService {
    constructor(private rbacService: RbacService) {}

    async createCustomRole() {
        const role = await this.rbacService.createRole(
            'content-manager',
            'Manages blog content'
        );

        const readPermission = await this.rbacService.findPermission('products', 'read');
        const updatePermission = await this.rbacService.findPermission('products', 'update');

        await this.rbacService.assignPermissionsToRole(
            role.id,
            [readPermission.id, updatePermission.id]
        );
    }
}
```

### Creating Custom Permissions

```typescript
await this.rbacService.createPermission(
    'reports',
    'export',
    'Export reports to PDF/Excel'
);
```

Permission naming convention: `resource:action`
- `products:read`
- `products:create`
- `users:update`
- `reports:export`

### Dynamic Permission Checks

```typescript
@Controller('resources')
export class ResourceController {
    constructor(
        private rbacService: RbacService,
        @Request() req
    ) {}

    @Get(':resource')
    async getResource(@Param('resource') resource: string) {
        const user = req.user;

        const canRead = await this.rbacService.userHasPermission(
            user,
            `${resource}:read`
        );

        if (!canRead) {
            throw new ForbiddenException();
        }

        // Fetch and return resource
    }
}
```

### Resource-Level Authorization

For more complex scenarios like "users can edit their own posts":

```typescript
@Controller('posts')
export class PostController {
    constructor(
        private postService: PostService,
        private rbacService: RbacService
    ) {}

    @Put(':id')
    async update(@Param('id') id: string, @Request() req, @Body() updateDto) {
        const post = await this.postService.findOne(id);
        const user = req.user;

        const isOwner = post.authorId === user.id;
        const isAdmin = await this.rbacService.userHasRole(user, 'admin');

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('You can only edit your own posts');
        }

        return this.postService.update(id, updateDto);
    }
}
```

### Assigning Roles to Users

```typescript
@Injectable()
export class UserManagementService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) {}

    async assignRole(userId: string, roleName: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        const role = await this.roleRepository.findOne({
            where: { name: roleName },
        });

        if (!user.roles) {
            user.roles = [];
        }

        if (!user.roles.find(r => r.id === role.id)) {
            user.roles.push(role);
            await this.userRepository.save(user);
        }
    }

    async removeRole(userId: string, roleName: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        user.roles = user.roles.filter(r => r.name !== roleName);
        await this.userRepository.save(user);
    }
}
```

---

## Security Considerations

### JWT Token Size

Embedding roles and permissions in JWT increases token size. For users with many roles/permissions, consider:

1. **Option 1**: Store only role IDs in JWT, fetch permissions on each request
2. **Option 2**: Use session-based auth for admin users with many permissions
3. **Option 3**: Implement token compression

Current implementation prioritizes performance (no DB lookup) over token size.

### Permission Naming

Use consistent, hierarchical naming:
```
resource:action
products:read
products:create
products:update
products:delete
users:read
users:create
admin:access
```

### Rate Limiting per Role

```typescript
@Controller('api')
export class ApiController {
    @Throttle({ default: { limit: 100, ttl: 60000 } }) // Regular users
    @Get('data')
    getData(@Request() req) {
        const user = req.user;
        const isAdmin = user.roles.some(r => r.name === 'admin');

        // Admins could have higher limits (implement custom throttler)
    }
}
```

### Audit Logging

Log all RBAC-related events:
```typescript
@Injectable()
export class AuditService {
    logRoleAssignment(adminId: string, userId: string, roleName: string) {
        Logger.log(
            `Admin ${adminId} assigned role ${roleName} to user ${userId}`,
            'RBAC'
        );
    }

    logPermissionDenied(userId: string, resource: string, action: string) {
        Logger.warn(
            `User ${userId} denied access to ${resource}:${action}`,
            'RBAC'
        );
    }
}
```

---

## Troubleshooting

### Forbidden Errors After Login

**Problem**: User gets 403 even after logging in

**Diagnosis**:
```bash
# Check if roles are in JWT
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Foobar1!"}'

# Decode the token at https://jwt.io
# Verify roles array is present
```

**Solutions**:
- Ensure user has roles assigned in database
- Verify eager loading: `relations: ['roles', 'roles.permissions']`
- Check that `generateToken()` includes roles in payload

### Guards Not Working

**Problem**: Decorators seem to be ignored

**Diagnosis**:
```typescript
// Check if guards are registered
@Controller('products')
@UseGuards(RolesGuard, PermissionsGuard)  // ← Must be present
export class ProductController {}
```

**Solutions**:
- Add `@UseGuards(RolesGuard, PermissionsGuard)` to controller or route
- Verify guards are imported from correct path
- Check that decorators are ABOVE the route handler:
  ```typescript
  @Roles('admin')  // ← Must be before @Get()
  @Get()
  ```

### User Has Role But Still Gets 403

**Problem**: Admin user gets forbidden on admin-only endpoint

**Diagnosis**:
1. Check database:
   ```sql
   SELECT u.email, r.name
   FROM users u
   JOIN user_roles ur ON u.id = ur."userId"
   JOIN roles r ON ur."roleId" = r.id
   WHERE u.email = 'admin@admin.com';
   ```

2. Check JWT payload (decode token at jwt.io)

3. Add logging to guard:
   ```typescript
   // In RolesGuard
   console.log('Required roles:', requiredRoles);
   console.log('User roles:', user.roles);
   ```

**Solutions**:
- Re-login to get fresh token with updated roles
- Verify role names match exactly (case-sensitive)
- Check that eager loading is working

### Permission Checks Always Fail

**Problem**: `@RequirePermissions` always returns 403

**Diagnosis**:
```typescript
// Check permission structure in JWT
// Should be: role.permissions = [{ resource: 'products', action: 'read' }]

// Add logging:
console.log('Required permissions:', requiredPermissions);
console.log('User permissions:', userPermissions);
```

**Solutions**:
- Verify permissions are seeded correctly
- Check that role has permissions assigned
- Ensure permission names match: `products:read` not `products-read`
- Re-login to get updated token

### Database Seeding Not Working

**Problem**: No roles/permissions after seeding

**Diagnosis**:
```bash
# Check logs
docker logs scaffold_app_dev | grep "Seeding"

# Check database
psql -U test -d test -c "SELECT * FROM roles;"
psql -U test -d test -c "SELECT * FROM permissions;"
```

**Solutions**:
- Set `SEED_DATABASE=true` in environment
- Check migration has run: `pnpm migration:show`
- Ensure tables are created
- Check for seed errors in logs

---

## Related Documentation

- [Authentication](./authentication.md)
- [API Versioning](./api-versioning.md)
- [Security](./security.md)
- [Database](./db.md)

---

## Summary

The RBAC system provides:

✅ **Role-Based Access Control** - Simple role checks (admin, user, moderator)
✅ **Permission-Based Access Control** - Granular permissions (products:read, users:delete)
✅ **JWT Integration** - Stateless authorization with roles in tokens
✅ **Flexible Guards** - Use roles, permissions, or both
✅ **Type-Safe** - Full TypeScript support
✅ **Production-Ready** - Migrations, seeding, and comprehensive examples
✅ **Well-Documented** - Complete API examples and troubleshooting guide

**Quick Example**:
```typescript
@Controller('admin')
@UseGuards(RolesGuard, PermissionsGuard)
export class AdminController {
    @Roles('admin')
    @RequirePermissions('users:delete')
    @Delete('users/:id')
    deleteUser() {
        // Only admins with delete permission
    }
}
```
