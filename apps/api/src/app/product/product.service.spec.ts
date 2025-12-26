import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { CreateProductDto, UpdateProductDto } from './product.dto';
import { Product } from './product.entity';
import { ProductService } from './product.service';

describe('ProductService', () => {
    let service: ProductService;

    const mockRepository = {
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
    };

    const mockCacheManager = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };

    const mockCreateProductDto: CreateProductDto = {
        name: 'Test Product',
        quantity: 10,
        unit: 'kg',
        price: 99.99,
        currency: 'USD',
        isActive: true,
    };

    const mockUpdateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99,
    };

    const mockProduct: Product = {
        id: 1,
        name: 'Test Product',
        quantity: 10,
        unit: 'kg',
        price: 99.99,
        currency: 'USD',
        isActive: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockRepository,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of products', async () => {
            mockCacheManager.get.mockResolvedValue(null);
            mockRepository.find.mockResolvedValue([mockProduct]);

            const result = await service.findAll();

            expect(mockCacheManager.get).toHaveBeenCalled();
            expect(mockRepository.find).toHaveBeenCalled();
            expect(mockCacheManager.set).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    id: mockProduct.id,
                    name: mockProduct.name,
                    quantity: mockProduct.quantity,
                    unit: mockProduct.unit,
                    price: mockProduct.price,
                    currency: mockProduct.currency,
                    isActive: mockProduct.isActive,
                },
            ]);
        });
    });

    describe('create', () => {
        it('should create and return a product', async () => {
            mockRepository.create.mockReturnValue(mockProduct);
            mockRepository.save.mockResolvedValue(mockProduct);

            const result = await service.create(mockCreateProductDto);

            expect(mockRepository.create).toHaveBeenCalledWith(mockCreateProductDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
            expect(mockCacheManager.del).toHaveBeenCalled();
            expect(result).toEqual({
                id: mockProduct.id,
                name: mockProduct.name,
                quantity: mockProduct.quantity,
                unit: mockProduct.unit,
                price: mockProduct.price,
                currency: mockProduct.currency,
                isActive: mockProduct.isActive,
            });
        });
    });

    describe('findOne', () => {
        it('should return a product by id', async () => {
            mockCacheManager.get.mockResolvedValue(null);
            mockRepository.findOneBy.mockResolvedValue(mockProduct);

            const result = await service.findOne(1);

            expect(mockCacheManager.get).toHaveBeenCalled();
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(mockCacheManager.set).toHaveBeenCalled();
            expect(result).toEqual({
                id: mockProduct.id,
                name: mockProduct.name,
                quantity: mockProduct.quantity,
                unit: mockProduct.unit,
                price: mockProduct.price,
                currency: mockProduct.currency,
                isActive: mockProduct.isActive,
            });
        });

        it('should throw NotFoundException if product not found', async () => {
            mockCacheManager.get.mockResolvedValue(null);
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Product with ID 999 not found');
        });
    });

    describe('update', () => {
        it('should update and return a product', async () => {
            const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };

            mockRepository.findOneBy.mockResolvedValue(mockProduct);
            mockRepository.save.mockResolvedValue(updatedProduct);

            const result = await service.update(1, mockUpdateProductDto);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(mockRepository.save).toHaveBeenCalledWith(updatedProduct);
            expect(mockCacheManager.del).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                id: updatedProduct.id,
                name: updatedProduct.name,
                quantity: updatedProduct.quantity,
                unit: updatedProduct.unit,
                price: updatedProduct.price,
                currency: updatedProduct.currency,
                isActive: updatedProduct.isActive,
            });
        });

        it('should throw NotFoundException if product not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(999, mockUpdateProductDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.update(999, mockUpdateProductDto)).rejects.toThrow(
                'Product with ID 999 not found',
            );
        });
    });

    describe('delete', () => {
        it('should delete a product', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 });

            await service.delete(1);

            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(mockCacheManager.del).toHaveBeenCalledTimes(2);
        });

        it('should throw NotFoundException if product not found', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 });

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Product with ID 999 not found');
        });
    });
});
