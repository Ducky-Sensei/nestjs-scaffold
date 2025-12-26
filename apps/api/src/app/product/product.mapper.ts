import type { ProductResponseDto } from './product.dto';
import type { Product } from './product.entity';

/**
 * Mapper functions to convert Product entities to DTOs
 * This decouples the API response from the database schema
 */
export const ProductMapper = {
    /**
     * Converts a Product entity to a ProductResponseDto
     * @param entity The Product entity from the database
     * @returns The ProductResponseDto for API responses
     */
    toDto(entity: Product): ProductResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            quantity: entity.quantity,
            unit: entity.unit,
            price: entity.price,
            currency: entity.currency,
            isActive: entity.isActive,
        };
    },

    /**
     * Converts an array of Product entities to ProductResponseDtos
     * @param entities Array of Product entities from the database
     * @returns Array of ProductResponseDtos for API responses
     */
    toDtoArray(entities: Product[]): ProductResponseDto[] {
        return entities.map((entity) => ProductMapper.toDto(entity));
    },
} as const;
