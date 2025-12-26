import { Exclude, Expose } from 'class-transformer';
import { Theme } from '../organization.entity';

@Exclude()
export class OrganizationResponseDto {
    @Expose()
    id: string;

    @Expose()
    customerId: string;

    @Expose()
    name: string;

    @Expose()
    description: string | null;

    @Expose()
    theme: Theme | null;

    @Expose()
    isActive: boolean;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
