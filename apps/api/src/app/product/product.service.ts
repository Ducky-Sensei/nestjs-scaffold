import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import type { Repository } from 'typeorm';
import type { CreateProductDto, ProductResponseDto, UpdateProductDto } from './product.dto';
import { Product } from './product.entity';
import { ProductMapper } from './product.mapper';

@Injectable()
export class ProductService {
    private readonly CACHE_KEY_ALL = 'products:all';
    private readonly CACHE_KEY_PREFIX = 'product:';

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    /**
     * Gets a list of all products.
     * Cached to reduce database load for frequently accessed data.
     * @returns A list of product DTOs.
     */
    async findAll(): Promise<ProductResponseDto[]> {
        const cached = await this.cacheManager.get<ProductResponseDto[]>(this.CACHE_KEY_ALL);
        if (cached) {
            return cached;
        }

        const products = await this.productRepository.find();
        const productDtos = ProductMapper.toDtoArray(products);

        await this.cacheManager.set(this.CACHE_KEY_ALL, productDtos);

        return productDtos;
    }

    /**
     * Creates a new product.
     * Invalidates the products list cache since the data has changed.
     * @param createProductDto The product data to create.
     * @returns The created product DTO.
     */
    async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        const product = this.productRepository.create(createProductDto);
        const savedProduct = await this.productRepository.save(product);

        await this.cacheManager.del(this.CACHE_KEY_ALL);

        return ProductMapper.toDto(savedProduct);
    }

    /**
     * Gets a single product by ID.
     * Cached to reduce database load for frequently accessed products.
     * @param id The ID of the product.
     * @returns The product DTO.
     * @throws NotFoundException if the product doesn't exist.
     */
    async findOne(id: number): Promise<ProductResponseDto> {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;

        const cached = await this.cacheManager.get<ProductResponseDto>(cacheKey);
        if (cached) {
            return cached;
        }

        const product = await this.productRepository.findOneBy({ id });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const productDto = ProductMapper.toDto(product);

        await this.cacheManager.set(cacheKey, productDto);

        return productDto;
    }

    /**
     * Updates an existing product.
     * Invalidates both the specific product cache and the products list cache.
     * @param id The ID of the product to update.
     * @param updateProductDto The fields to update.
     * @returns The updated product DTO.
     * @throws NotFoundException if the product doesn't exist.
     */
    async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        const product = await this.productRepository.findOneBy({ id });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        Object.assign(product, updateProductDto);
        const updatedProduct = await this.productRepository.save(product);

        await Promise.all([
            this.cacheManager.del(this.CACHE_KEY_ALL), // List cache
            this.cacheManager.del(`${this.CACHE_KEY_PREFIX}${id}`), // Specific product cache
        ]);

        return ProductMapper.toDto(updatedProduct);
    }

    /**
     * Deletes a product by ID.
     * Invalidates both the specific product cache and the products list cache.
     * @param id The ID of the product to delete.
     * @throws NotFoundException if the product doesn't exist.
     */
    async delete(id: number): Promise<void> {
        const result = await this.productRepository.delete(id);

        if (!result.affected) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await Promise.all([
            this.cacheManager.del(this.CACHE_KEY_ALL),
            this.cacheManager.del(`${this.CACHE_KEY_PREFIX}${id}`),
        ]);
    }
}
