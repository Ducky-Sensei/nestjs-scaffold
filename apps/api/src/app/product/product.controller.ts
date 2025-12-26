import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions, Roles } from '../rbac/decorators';
import { PermissionsGuard, RolesGuard } from '../rbac/guards';
import { CreateProductDto, ProductResponseDto, UpdateProductDto } from './product.dto';
import { ProductService } from './product.service';

@ApiTags('v1/products')
@Controller({
    path: 'products',
    version: '1',
})
@UseGuards(RolesGuard, PermissionsGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @ApiOperation({ summary: 'Get all products' })
    @ApiOkResponse({
        description: 'List of all products',
        type: [ProductResponseDto],
    })
    @RequirePermissions('products:read')
    @Get()
    findAll(): Promise<ProductResponseDto[]> {
        return this.productService.findAll();
    }

    @ApiOperation({ summary: 'Get a product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID', type: Number })
    @ApiOkResponse({
        description: 'Product details',
        type: ProductResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Product not found' })
    @RequirePermissions('products:read')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
        return this.productService.findOne(id);
    }

    @ApiOperation({ summary: 'Create a new product' })
    @ApiCreatedResponse({
        description: 'Product successfully created',
        type: ProductResponseDto,
    })
    @RequirePermissions('products:create')
    @Roles('admin', 'moderator')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        return this.productService.create(createProductDto);
    }

    @ApiOperation({ summary: 'Update an existing product' })
    @ApiParam({ name: 'id', description: 'Product ID', type: Number })
    @ApiOkResponse({
        description: 'Product successfully updated',
        type: ProductResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Product not found' })
    @RequirePermissions('products:update')
    @Roles('admin', 'moderator')
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<ProductResponseDto> {
        return this.productService.update(id, updateProductDto);
    }

    @ApiOperation({ summary: 'Delete a product' })
    @ApiParam({ name: 'id', description: 'Product ID', type: Number })
    @ApiNoContentResponse({ description: 'Product successfully deleted' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    @RequirePermissions('products:delete')
    @Roles('admin')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.productService.delete(id);
    }
}
