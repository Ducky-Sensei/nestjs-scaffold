import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    @Index()
    tokenHash: string;

    @Column({ type: 'uuid' })
    @Index()
    userId: string;

    @ManyToOne(
        () => User,
        (user) => user.refreshTokens,
        { onDelete: 'CASCADE' },
    )
    user: User;

    @Column({ type: 'timestamp' })
    @Index()
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    isRevoked: boolean;

    @Column({ nullable: true, type: 'varchar' })
    userAgent: string | null;

    @Column({ nullable: true, type: 'varchar' })
    ipAddress: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
