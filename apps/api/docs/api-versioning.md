# API Versioning

## Overview

This API uses **URI-based versioning** to manage API versions. All endpoints are prefixed with a version number (e.g., `/v1/products`).

## Why API Versioning?

API versioning allows you to:

1. **Make breaking changes** without affecting existing clients
2. **Maintain backward compatibility** for older clients
3. **Iterate rapidly** on new features in newer versions
4. **Deprecate old versions** gradually over time
5. **Support multiple client versions** simultaneously

## Versioning Strategy

### URI Versioning (Current)

All API endpoints are prefixed with `/v{version}/`:

```
GET /v1/products
POST /v1/products
GET /v1/products/:id
```

**Benefits:**

- ✅ Clear and explicit version in URL
- ✅ Easy to test different versions
- ✅ Simple to cache
- ✅ Easy to route in API gateways
- ✅ Version visible in logs and monitoring

## Current Version

**Current Version:** `v1`

All endpoints use version `1` as the default.

## API Endpoints

### Version 1 (v1)

#### Products API

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| GET    | `/v1/products`     | Get all products     |
| GET    | `/v1/products/:id` | Get product by ID    |
| POST   | `/v1/products`     | Create a new product |
| PUT    | `/v1/products/:id` | Update a product     |
| DELETE | `/v1/products/:id` | Delete a product     |

#### Health Checks (Unversioned)

| Method | Endpoint        | Description     |
| ------ | --------------- | --------------- |
| GET    | `/health`       | Health check    |
| GET    | `/health/live`  | Liveness probe  |
| GET    | `/health/ready` | Readiness probe |

**Note:** Health check endpoints are **not versioned** as they're infrastructure-level endpoints.

## Making API Calls

### JavaScript/TypeScript

```typescript
// Version 1 endpoint
const response = await fetch("http://localhost:8000/v1/products");
const products = await response.json();
```

### cURL

```bash
# Version 1 endpoint
curl http://localhost:8000/v1/products

# With authentication (when added)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/v1/products
```

### Axios

```typescript
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/v1",
});

// Now all requests are automatically versioned
const products = await api.get("/products");
```

## Creating a New API Version

When you need to introduce breaking changes, create a new version:

### Step 1: Create Version 2 Controller

```typescript
// src/app/product/v2/product.controller.ts
@ApiTags("v2/products")
@Controller({
    path: "products",
    version: "2",
})
export class ProductV2Controller {
    // New implementation with breaking changes
}
```

### Step 2: Create Version-Specific DTOs

```typescript
// src/app/product/v2/product.dto.ts
export class CreateProductV2Dto {
    // New fields or different structure
    name: string;
    description: string; // New required field in v2
    price: {
        // Nested structure in v2
        amount: number;
        currency: string;
    };
}
```

### Step 3: Register in Module

```typescript
// src/app/product/product.module.ts
@Module({
    controllers: [
        ProductController, // v1
        ProductV2Controller, // v2
    ],
    providers: [ProductService],
})
export class ProductModule {}
```

### Step 4: Update Swagger

```typescript
// src/main-dev.ts
const config = new DocumentBuilder().setTitle("NestJS Scaffold API").setDescription("Production-ready NestJS API").setVersion("2.0").addTag("v1/products", "Product management endpoints (v1)").addTag("v2/products", "Product management endpoints (v2 - Latest)").build();
```

## Version-Specific Endpoints

You can also version individual endpoints within a controller:

```typescript
@Controller("products")
export class ProductController {
    // Available in v1 and v2
    @Get()
    @Version(["1", "2"])
    findAll() {
        return this.service.findAll();
    }

    // Only available in v2
    @Get("advanced-search")
    @Version("2")
    advancedSearch() {
        return this.service.advancedSearch();
    }

    // Only available in v1 (deprecated in v2)
    @Get("legacy-format")
    @Version("1")
    legacyFormat() {
        return this.service.legacyFormat();
    }
}
```

## Default Version

The application is configured with a default version (`1`):

```typescript
app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
});
```

This means endpoints without an explicit version will use `v1` by default.

## Deprecation Strategy

When deprecating an API version:

### 1. Announce Deprecation

Add deprecation notices to:

- API documentation
- Response headers
- Changelog
- Client notifications

```typescript
@ApiDeprecated("This endpoint is deprecated. Use v2 instead.")
@Controller({
    path: "products",
    version: "1",
})
export class ProductController {
    // Add deprecation header
    @Get()
    @Header("X-API-Warn", "Deprecated. Use /v2/products")
    findAll() {
        // ...
    }
}
```

### 2. Provide Migration Guide

Document the changes and how to migrate:

````markdown
## Migration from v1 to v2

### Breaking Changes

1. **Price field structure changed**
    ```diff
    - price: 29.99
    - currency: "USD"
    + price: {
    +   amount: 29.99,
    +   currency: "USD"
    + }
    ```
````

2. **Description is now required**
    ```diff
    {
      name: "Product",
    + description: "Product description"
    }
    ```

````

### 3. Set Sunset Date

Give clients time to migrate (e.g., 6 months):

```typescript
@Header('Sunset', 'Sat, 31 Dec 2025 23:59:59 GMT')
````

### 4. Monitor Usage

Track which versions are being used:

```typescript
// Add middleware to log version usage
app.use((req, res, next) => {
    const version = req.url.match(/\/v(\d+)\//)?.[1];
    logger.info("API version used", { version, path: req.path });
    next();
});
```

### 5. Remove Old Version

After the sunset date, remove the old version:

1. Remove the controller
2. Update documentation
3. Update tests
4. Deploy

## Best Practices

### 1. Version Everything from Day One

Even if you don't plan changes, start with `/v1/` to make future versioning easier.

### 2. Keep Versions Alive

Maintain at least 2 versions simultaneously to give clients time to migrate.

### 3. Don't Over-Version

Not every change needs a new version. Only create new versions for **breaking changes**:

**Breaking Changes (need new version):**

- Removing fields
- Renaming fields
- Changing field types
- Changing response structure
- Removing endpoints
- Changing business logic significantly

**Non-Breaking Changes (don't need new version):**

- Adding optional fields
- Adding new endpoints
- Adding enum values
- Fixing bugs
- Performance improvements

### 4. Document All Versions

Keep documentation for all active versions in Swagger.

### 5. Test All Versions

Ensure tests cover all supported versions:

```typescript
describe("Products API", () => {
    describe("v1", () => {
        it("should get products from v1 endpoint", async () => {
            const response = await request(app.getHttpServer()).get("/v1/products").expect(200);
        });
    });

    describe("v2", () => {
        it("should get products from v2 endpoint", async () => {
            const response = await request(app.getHttpServer()).get("/v2/products").expect(200);
        });
    });
});
```

### 6. Use Semantic Versioning

- **Major version** (v1 → v2): Breaking changes
- **Minor version** (internal): New features, no breaking changes
- **Patch version** (internal): Bug fixes

Only expose **major versions** in the API URL.

### 7. Consider Header Versioning for Internal APIs

For internal microservices, header-based versioning can be simpler:

```typescript
app.enableVersioning({
    type: VersioningType.HEADER,
    header: "X-API-Version",
});
```

## Alternative Versioning Strategies

### Header Versioning

```typescript
app.enableVersioning({
    type: VersioningType.HEADER,
    header: "X-API-Version",
});

// Client sends:
// X-API-Version: 1
```

**Pros:**

- Clean URLs
- Easy to add to existing APIs

**Cons:**

- Less visible
- Harder to test manually
- Cache issues

### Media Type Versioning

```typescript
app.enableVersioning({
    type: VersioningType.MEDIA_TYPE,
    key: "v=",
});

// Client sends:
// Accept: application/json;v=1
```

**Pros:**

- RESTful
- Content negotiation

**Cons:**

- Complex
- Harder to use
- Harder to cache

### Query Parameter Versioning

```typescript
app.enableVersioning({
    type: VersioningType.CUSTOM,
});

// Client sends:
// GET /products?version=1
```

**Pros:**

- Easy to implement
- Works with GET requests

**Cons:**

- Query params should be for filtering, not versioning
- Can be accidentally cached

## Version Lifecycle Example

```
v1 (Current)
├── Launch: Jan 2024
├── Stable: Jan 2024 - Dec 2024
└── Status: Active

v2 (Next)
├── Beta: Oct 2024
├── Launch: Jan 2025
├── Deprecate v1: Jan 2025
├── Sunset v1: Jul 2025
└── Status: Planning

Timeline:
---------
Jan 2024    v1 launches (current)
Oct 2024    v2 beta available
Jan 2025    v2 stable, v1 deprecated
Jul 2025    v1 removed
```

## Testing Versioned APIs

### Integration Tests

```typescript
describe("API Versioning", () => {
    it("should accept v1 requests", async () => {
        const response = await request(app.getHttpServer()).get("/v1/products").expect(200);
    });

    it("should return 404 for unsupported version", async () => {
        const response = await request(app.getHttpServer()).get("/v99/products").expect(404);
    });

    it("should use default version", async () => {
        // If defaultVersion is set
        const response = await request(app.getHttpServer())
            .get("/products") // No version prefix
            .expect(200);
    });
});
```

## Monitoring

Track version usage in your monitoring:

```typescript
// Custom middleware
app.use((req, res, next) => {
    const version = req.url.match(/\/v(\d+)\//)?.[1] || "default";
    metrics.increment("api.version.usage", { version });
    next();
});
```

Monitor:

- Requests per version
- Error rates per version
- Response times per version
- Deprecated version usage

## Summary

- ✅ Use URI versioning with `/v1/` prefix
- ✅ Start with v1 from day one
- ✅ Only version for breaking changes
- ✅ Support at least 2 versions simultaneously
- ✅ Document deprecation clearly
- ✅ Monitor version usage
- ✅ Test all supported versions
- ✅ Give clients 6+ months to migrate

This ensures smooth API evolution without breaking existing clients! 🚀
