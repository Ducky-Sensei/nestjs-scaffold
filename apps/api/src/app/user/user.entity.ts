import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Organization } from '../organization/organization.entity';
import { Role } from '../rbac/entities/role.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, type: 'varchar' })
    password: string | null;

    @Column({ nullable: true, type: 'varchar' })
    name: string | null;

    // OAuth provider fields
    @Column({ nullable: true, type: 'varchar' })
    authProvider: string | null;

    @Column({ nullable: true, type: 'varchar' })
    authProviderId: string | null;

    @Column({ nullable: true, type: 'json' })
    authProviderData: Record<string, any> | null;

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(
        () => Role,
        (role) => role.users,
    )
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
    })
    roles: Role[];

    @OneToMany(
        () => RefreshToken,
        (refreshToken) => refreshToken.user,
    )
    refreshTokens: RefreshToken[];

    @ManyToMany(
        () => Organization,
        (organization) => organization.members,
        { nullable: true },
    )
    @JoinTable({
        name: 'user_organizations',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'organizationId', referencedColumnName: 'id' },
    })
    organizations?: Organization[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
