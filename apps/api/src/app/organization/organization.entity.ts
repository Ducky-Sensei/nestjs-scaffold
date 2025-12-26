import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export interface ThemeColors {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
}

export interface Theme {
    id: string;
    name: string;
    light: ThemeColors;
    dark?: ThemeColors;
    radius?: string;
}

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    customerId: string;

    @Column()
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string | null;

    @Column({ type: 'jsonb', nullable: true })
    theme: Theme | null;

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(
        () => User,
        (user) => user.organizations,
    )
    members: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
