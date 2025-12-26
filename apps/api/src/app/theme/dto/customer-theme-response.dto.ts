import { Exclude, Expose } from 'class-transformer';
import type { Theme } from '../../organization/organization.entity';

@Exclude()
export class CustomerThemeResponseDto {
    @Expose()
    customerId: string;

    @Expose()
    customerName: string;

    @Expose()
    theme: Theme;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
