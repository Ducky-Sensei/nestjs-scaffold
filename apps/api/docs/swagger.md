# Swagger/OpenAPI Documentation

## Overview

This scaffold includes Swagger/OpenAPI documentation for all API endpoints. Swagger provides an interactive UI to explore and test your API during development.

## Accessing Swagger UI

Swagger is **only available in development mode** (not in production).

### Start Development Server

```bash
pnpm start:dev
```

### Open Swagger UI

Once the server is running, open your browser and navigate to:

```
http://localhost:8000/api
```

You should see:
- Interactive API documentation
- All available endpoints
- Request/response schemas
- Ability to test endpoints directly from the browser

## Features

### Interactive API Explorer

The Swagger UI provides:

1. **Endpoint List** - All available API endpoints grouped by tags
2. **Request Schemas** - Example request bodies with validation rules
3. **Response Schemas** - Expected response formats with examples
4. **Try It Out** - Test endpoints directly from the browser
5. **Authentication** - Support for authentication tokens (when configured)

### Example Usage

1. Navigate to http://localhost:8000/api
2. Find the "products" section
3. Click on "POST /products" to expand
4. Click "Try it out"
5. Edit the request body:
   ```json
   {
     "name": "Premium Coffee Beans",
     "quantity": 100,
     "unit": "kg",
     "price": 29.99,
     "currency": "USD",
     "isActive": true
   }
   ```
6. Click "Execute"
7. See the response below

## Swagger CLI Plugin (Automatic Documentation)

This scaffold uses the **Swagger CLI Plugin** to **automatically generate most API documentation** from your code. This means you write **much less boilerplate**!

### How It Works

The plugin is configured in `nest-cli.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true,
          "dtoFileNameSuffix": [".dto.ts", ".entity.ts"]
        }
      }
    ]
  }
}
```

### What Gets Generated Automatically

The plugin reads your code and automatically generates `@ApiProperty()` decorators from:

1. **TypeScript types** → `type` in Swagger
2. **class-validator decorators** → validation constraints
3. **JSDoc comments** → descriptions
4. **@IsOptional()** → marks as optional

### Example

**What you write:**
```typescript
export class CreateProductDto {
    /** Product name */
    @IsString()
    @Length(1, 255)
    name: string;

    /** Product quantity */
    @IsPositive()
    quantity: number;
}
```

**What the plugin generates (equivalent to):**
```typescript
export class CreateProductDto {
    @ApiProperty({
        type: String,
        required: true,
        minLength: 1,
        maxLength: 255,
        description: 'Product name'
    })
    @IsString()
    @Length(1, 255)
    name: string;

    @ApiProperty({
        type: Number,
        required: true,
        minimum: 0.01,
        description: 'Product quantity'
    })
    @IsPositive()
    quantity: number;
}
```

### When to Add @ApiProperty Manually

You only need to manually add `@ApiProperty()` when you want:

1. **Custom examples** - Show realistic example values
   ```typescript
   @ApiProperty({ example: 'Premium Coffee Beans' })
   name: string;
   ```

2. **Enum values** - Define allowed values
   ```typescript
   @ApiProperty({ enum: ['USD', 'EUR', 'GBP'] })
   currency: string;
   ```

3. **Array item types** - Specify what's in the array
   ```typescript
   @ApiProperty({ type: [ProductDto] })
   products: ProductDto[];
   ```

4. **Nested objects** - Document complex structures
   ```typescript
   @ApiProperty({ type: () => AddressDto })
   address: AddressDto;
   ```

5. **Custom descriptions** - Override JSDoc comment
   ```typescript
   @ApiProperty({ description: 'Very detailed description...' })
   field: string;
   ```

### Best Practice

**Hybrid Approach** (Recommended):

- Let the plugin handle basic fields
- Add `@ApiProperty()` only for important fields that need examples

```typescript
export class CreateProductDto {
    // Custom example for important field
    @ApiProperty({ example: 'Premium Coffee Beans' })
    @IsString()
    @Length(1, 255)
    name: string;

    // Plugin auto-generates ✅
    /** Product quantity */
    @IsPositive()
    quantity: number;

    // Plugin auto-generates ✅
    /** Unit of measurement */
    @IsString()
    @Length(1, 10)
    unit: string;

    // Custom example for important field
    @ApiProperty({ example: 29.99 })
    @IsPositive()
    price: number;

    // Custom example for clarity
    @ApiProperty({ example: 'USD' })
    @IsString()
    @Length(3, 3)
    currency: string;
}
```

## Configuration

Swagger is configured in `src/main-dev.ts`:

```typescript
const config = new DocumentBuilder()
    .setTitle('NestJS Scaffold API')
    .setDescription('Production-ready NestJS API with TypeORM and PostgreSQL')
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

### Customization

You can customize the Swagger configuration by:

1. **Change the path**: Modify `'api'` in `SwaggerModule.setup('api', app, document)`
2. **Add authentication**: Use `.addBearerAuth()` in the DocumentBuilder
3. **Add tags**: Use `.addTag()` for each resource group
4. **Add servers**: Use `.addServer()` for different environments

## Decorators

The scaffold uses Swagger decorators to document the API:

### Controller Level

```typescript
@ApiTags('products')  // Groups endpoints in Swagger UI
@Controller('products')
export class ProductController {
  // ...
}
```

### Endpoint Level

```typescript
@ApiOperation({ summary: 'Get all products' })
@ApiOkResponse({
    description: 'List of all products',
    type: [ProductResponseDto],
})
@Get()
findAll(): Promise<ProductResponseDto[]> {
  // ...
}
```

### DTO Level

```typescript
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
}
```

## Common Decorators

### Response Decorators

- `@ApiOkResponse()` - 200 OK response
- `@ApiCreatedResponse()` - 201 Created response
- `@ApiNoContentResponse()` - 204 No Content response
- `@ApiBadRequestResponse()` - 400 Bad Request response
- `@ApiNotFoundResponse()` - 404 Not Found response
- `@ApiInternalServerErrorResponse()` - 500 Internal Server Error response

### Request Decorators

- `@ApiBody()` - Request body schema
- `@ApiParam()` - Path parameter
- `@ApiQuery()` - Query parameter
- `@ApiHeader()` - Required header

### Property Decorators

- `@ApiProperty()` - Required property in schema
- `@ApiPropertyOptional()` - Optional property in schema
- `@ApiHideProperty()` - Hide property from schema

## Adding Documentation to New Endpoints

When creating new endpoints, follow this pattern:

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
    @ApiOperation({ summary: 'Create a new user' })
    @ApiCreatedResponse({
        description: 'User successfully created',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid input' })
    @Post()
    create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(dto);
    }
}
```

## Exporting OpenAPI Specification

To export the OpenAPI spec as JSON:

1. Start the development server: `pnpm start:dev`
2. Visit: http://localhost:8000/api-json

This gives you the raw OpenAPI 3.0 specification that can be:
- Imported into API clients (Postman, Insomnia)
- Used for code generation
- Shared with frontend teams
- Versioned in your repository

## Why Swagger is Development-Only

Swagger is configured **only in development** (`main-dev.ts`) because:

1. **Performance** - Swagger adds overhead and memory usage
2. **Security** - API documentation can expose implementation details
3. **Size** - Reduces production bundle size
4. **Best Practice** - Production APIs should use versioned OpenAPI specs, not live Swagger UI

For production:
- Export the OpenAPI spec during build
- Host static API docs separately
- Use API gateways for documentation
- Provide versioned API specs to consumers

## Best Practices

1. **Document All Endpoints** - Every controller method should have decorators
2. **Provide Examples** - Use realistic examples in `@ApiProperty()`
3. **Describe Responses** - Document all possible response codes
4. **Use DTOs** - Swagger automatically generates schemas from DTOs
5. **Group by Tags** - Use `@ApiTags()` to organize endpoints
6. **Keep It Updated** - Update decorators when changing endpoints

## Troubleshooting

### Swagger UI Not Loading

1. Make sure you're running in development mode: `pnpm start:dev`
2. Check the console logs for "Swagger documentation available at..."
3. Ensure you're visiting the correct URL: http://localhost:8000/api
4. Clear browser cache and reload

### Schemas Not Showing

1. Ensure DTOs have `@ApiProperty()` decorators
2. Check that DTOs are exported from their module
3. Verify the DTO is referenced in controller decorators
4. Check for TypeScript compilation errors

### Endpoints Not Appearing

1. Verify the controller is registered in a module
2. Check that the module is imported in AppModule
3. Ensure decorators are applied correctly
4. Restart the development server

## Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
