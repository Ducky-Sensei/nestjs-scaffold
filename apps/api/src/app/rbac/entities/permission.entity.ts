import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
@Index('IDX_PERMISSION_RESOURCE_ACTION', ['resource', 'action'], { unique: true })
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    resource: string;

    @Column()
    action: string;

    @Column({ nullable: true })
    description: string;

    @ManyToMany(
        () => Role,
        (role) => role.permissions,
    )
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    get name(): string {
        return `${this.resource}:${this.action}`;
    }
}
