import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';

/**
 * DTO for creating a new product
 */
export class CreateProductDto {
    @ApiProperty({
        description: 'Product name',
        example: 'Premium Coffee Beans',
        minLength: 1,
        maxLength: 255,
    })
    @IsString()
    @Length(1, 255)
    name: string;

    @ApiProperty({
        description: 'Product quantity',
        example: 100,
        minimum: 0.01,
    })
    @IsPositive()
    quantity: number;

    @ApiProperty({
        description: 'Unit of measurement',
        example: 'kg',
        minLength: 1,
        maxLength: 10,
    })
    @IsString()
    @Length(1, 10)
    unit: string;

    @ApiProperty({
        description: 'Product price',
        example: 29.99,
        minimum: 0.01,
    })
    @IsPositive()
    price: number;

    @ApiProperty({
        description: 'Currency code (ISO 4217)',
        example: 'USD',
        minLength: 3,
        maxLength: 3,
    })
    @IsString()
    @Length(3, 3)
    currency: string;

    @ApiPropertyOptional({
        description: 'Whether the product is active',
        example: true,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

/**
 * DTO for updating an existing product
 * All fields are optional to allow partial updates
 */
export class UpdateProductDto {
    @ApiPropertyOptional({
        description: 'Product name',
        example: 'Premium Coffee Beans',
        minLength: 1,
        maxLength: 255,
    })
    @IsString()
    @Length(1, 255)
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'Product quantity',
        example: 100,
        minimum: 0.01,
    })
    @IsPositive()
    @IsOptional()
    quantity?: number;

    @ApiPropertyOptional({
        description: 'Unit of measurement',
        example: 'kg',
        minLength: 1,
        maxLength: 10,
    })
    @IsString()
    @Length(1, 10)
    @IsOptional()
    unit?: string;

    @ApiPropertyOptional({
        description: 'Product price',
        example: 29.99,
        minimum: 0,
    })
    @Min(0)
    @IsOptional()
    price?: number;

    @ApiPropertyOptional({
        description: 'Currency code (ISO 4217)',
        example: 'USD',
        minLength: 3,
        maxLength: 3,
    })
    @IsString()
    @Length(3, 3)
    @IsOptional()
    currency?: string;

    @ApiPropertyOptional({
        description: 'Whether the product is active',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

/**
 * DTO for product responses
 * This is what the API returns to clients
 * Separates the API contract from the database schema
 */
export class ProductResponseDto {
    @ApiProperty({
        description: 'Product ID',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'Product name',
        example: 'Premium Coffee Beans',
    })
    name: string;

    @ApiProperty({
        description: 'Product quantity',
        example: 100,
    })
    quantity: number;

    @ApiProperty({
        description: 'Unit of measurement',
        example: 'kg',
    })
    unit: string;

    @ApiProperty({
        description: 'Product price',
        example: 29.99,
    })
    price: number;

    @ApiProperty({
        description: 'Currency code (ISO 4217)',
        example: 'USD',
    })
    currency: string;

    @ApiProperty({
        description: 'Whether the product is active',
        example: true,
    })
    isActive: boolean;
}
