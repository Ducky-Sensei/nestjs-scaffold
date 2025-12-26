import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'float' })
    quantity: number;

    @Column()
    unit: string;

    @Column({ type: 'float' })
    price: number;

    @Column()
    currency: string;

    @Column({ default: true })
    isActive: boolean;
}
