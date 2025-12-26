# Request Validation

## Overview

The application uses NestJS `ValidationPipe` with `class-validator` decorators to automatically validate all incoming requests. Invalid requests are rejected with detailed error messages before reaching your business logic.

## Configuration

Validation is configured globally in `main.ts` and `main-dev.ts`:

```typescript
app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,              // Strip unknown properties
        forbidNonWhitelisted: true,   // Reject requests with unknown properties
        transform: true,               // Transform to DTO instances
        transformOptions: {
            enableImplicitConversion: true, // Auto-convert types
        },
    }),
);
```

### Options Explained

- **whitelist: true** - Automatically removes properties that don't have validation decorators
- **forbidNonWhitelisted: true** - Throws an error if unknown properties are sent
- **transform: true** - Converts plain JavaScript objects to DTO class instances
- **enableImplicitConversion: true** - Automatically converts types (e.g., `"5"` → `5`)

## Creating DTOs

DTOs (Data Transfer Objects) define the shape and validation rules for your requests.

### Basic Example

```typescript
import { IsString, IsNumber, IsOptional, Min, Max, Length } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @Length(1, 255)
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    @IsOptional()
    description?: string;
}
```

### Update DTOs

For updates, all fields should be optional:

```typescript
import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @Length(1, 255)
    @IsOptional()
    name?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;
}
```

## Common Validation Decorators

### Type Validation

```typescript
@IsString()        // Must be a string
@IsNumber()        // Must be a number
@IsInt()           // Must be an integer
@IsBoolean()       // Must be a boolean
@IsDate()          // Must be a date
@IsArray()         // Must be an array
@IsObject()        // Must be an object
@IsEmail()         // Must be a valid email
@IsUrl()           // Must be a valid URL
@IsUUID()          // Must be a valid UUID
```

### Number Validation

```typescript
@Min(0)            // Minimum value
@Max(100)          // Maximum value
@IsPositive()      // Must be > 0
@IsNegative()      // Must be < 0
@IsDivisibleBy(5)  // Must be divisible by 5
```

### String Validation

```typescript
@Length(5, 10)     // Length between 5-10 characters
@MinLength(5)      // Minimum 5 characters
@MaxLength(100)    // Maximum 100 characters
@Contains('hello') // Must contain 'hello'
@Matches(/^[a-z]+$/) // Must match regex
```

### Array Validation

```typescript
@ArrayMinSize(1)   // Array must have at least 1 item
@ArrayMaxSize(10)  // Array must have at most 10 items
@ArrayUnique()     // Array values must be unique
```

### Optional Fields

```typescript
@IsOptional()      // Field can be undefined/null
```

### Nested Objects

```typescript
import { ValidateNested, Type } from 'class-validator';

export class AddressDto {
    @IsString()
    street: string;

    @IsString()
    city: string;
}

export class UserDto {
    @IsString()
    name: string;

    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}
```

## Validation Error Responses

When validation fails, the API returns a 400 Bad Request with detailed error information:

### Single Validation Error

**Request:**
```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "", "price": -10}'
```

**Response:**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": [
    "name must be longer than or equal to 1 characters",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Unknown Properties

**Request:**
```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Product", "price": 99, "hacker": "payload"}'
```

**Response:**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": [
    "property hacker should not exist"
  ],
  "error": "Bad Request"
}
```

### Type Conversion Errors

**Request:**
```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Product", "price": "not-a-number"}'
```

**Response:**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-08T12:00:00.000Z",
  "path": "/products",
  "method": "POST",
  "message": [
    "price must be a positive number",
    "price must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request"
}
```

## Automatic Type Transformation

With `transform: true` and `enableImplicitConversion: true`, the ValidationPipe automatically converts types:

### String to Number

**Request:**
```json
{
  "name": "Product",
  "price": "99.99"
}
```

**Transformed to:**
```json
{
  "name": "Product",
  "price": 99.99
}
```

### String to Boolean

**Request:**
```json
{
  "isActive": "true"
}
```

**Transformed to:**
```json
{
  "isActive": true
}
```

### Query Parameters

Query parameters are automatically converted:

```typescript
@Get()
findAll(@Query('limit') limit: number) {
    // /products?limit=10
    // limit is automatically converted to number 10
}
```

## Custom Validation

Create custom validators for complex validation logic:

```typescript
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isLongerThan', async: false })
export class IsLongerThanConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: any) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        return value.length > relatedValue.length;
    }

    defaultMessage(args: any) {
        return `$property must be longer than ${args.constraints[0]}`;
    }
}

export function IsLongerThan(property: string, validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsLongerThanConstraint,
        });
    };
}

// Usage
export class CreateUserDto {
    @IsString()
    firstName: string;

    @IsString()
    @IsLongerThan('firstName')
    lastName: string;
}
```

## Best Practices

1. **Separate Create and Update DTOs** - Create DTOs require all fields, Update DTOs have all fields optional
2. **Use Specific Validators** - Use `@IsEmail()` instead of just `@IsString()` for emails
3. **Set Reasonable Limits** - Always set min/max lengths and values to prevent abuse
4. **Validate Nested Objects** - Use `@ValidateNested()` for complex objects
5. **Use @IsOptional() Correctly** - Only for truly optional fields, required fields should not have it
6. **Whitelist Properties** - Always use `whitelist: true` to prevent mass assignment vulnerabilities
7. **Transform Data** - Use `transform: true` for automatic type conversion and DTO instances
8. **Document Validation Rules** - Add comments to explain complex validation logic

## Security Considerations

1. **Mass Assignment Protection** - `whitelist: true` prevents unknown properties
2. **Type Safety** - Validation ensures data matches expected types
3. **SQL Injection Prevention** - Combined with TypeORM, prevents injection attacks
4. **Data Sanitization** - Automatically strips malicious properties
5. **Size Limits** - Always set max lengths to prevent DoS attacks

## Testing Validation

### Unit Tests

```typescript
import { validate } from 'class-validator';
import { CreateProductDto } from './product.dto';

describe('CreateProductDto', () => {
    it('should validate a valid product', async () => {
        const dto = new CreateProductDto();
        dto.name = 'Product 1';
        dto.price = 99.99;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should reject invalid price', async () => {
        const dto = new CreateProductDto();
        dto.name = 'Product 1';
        dto.price = -10;

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('price');
    });
});
```

### E2E Tests

```typescript
it('should reject invalid product data', () => {
    return request(app.getHttpServer())
        .post('/products')
        .send({ name: '', price: -10 })
        .expect(400)
        .expect((res) => {
            expect(res.body.message).toContain('name must be longer');
            expect(res.body.message).toContain('price must be a positive');
        });
});
```

## Example: Complete Product DTO

```typescript
import {
    IsBoolean,
    IsOptional,
    IsPositive,
    IsString,
    Length,
    Min,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @Length(1, 255)
    name: string;

    @IsPositive()
    quantity: number;

    @IsString()
    @Length(1, 10)
    unit: string;

    @IsPositive()
    price: number;

    @IsString()
    @Length(3, 3)
    currency: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateProductDto {
    @IsString()
    @Length(1, 255)
    @IsOptional()
    name?: string;

    @IsPositive()
    @IsOptional()
    quantity?: number;

    @IsString()
    @Length(1, 10)
    @IsOptional()
    unit?: string;

    @Min(0)
    @IsOptional()
    price?: number;

    @IsString()
    @Length(3, 3)
    @IsOptional()
    currency?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
```
