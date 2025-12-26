import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import type { Theme } from '../organization.entity';

export class CreateOrganizationDto {
    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    theme?: Theme;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
