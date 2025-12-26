# API Documentation

## Base URL

When running locally:
- Development: `http://localhost:8000`

## Endpoints

### Health Checks

The application provides multiple health check endpoints for monitoring and orchestration (Kubernetes, Docker, etc.).

#### Combined Health Check

```http
GET /health
```

Checks the overall health of the application including database connectivity.

**Response (Healthy):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

**Response (Unhealthy):**
```json
{
  "status": "error",
  "info": {},
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  },
  "details": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  }
}
```

#### Readiness Probe

```http
GET /health/ready
```

Indicates if the application is ready to accept traffic. Checks all dependencies including the database.

**Use case:** Kubernetes readiness probe

#### Liveness Probe

```http
GET /health/live
```

Indicates if the application is running. Does not check dependencies.

**Use case:** Kubernetes liveness probe

**Response:**
```json
{
  "status": "ok",
  "info": {},
  "error": {},
  "details": {}
}
```

### Application

#### Simple Health Check

```http
GET /
```

Returns a simple health check message.

**Response:**
```
Hello World!
```

### Products

#### Get All Products

```http
GET /products
```

Returns a list of all products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "price": 99.99,
    "description": "Product description"
  }
]
```

#### Get Product by ID

```http
GET /products/:id
```

Returns a single product by ID.

**Parameters:**
- `id` (path parameter) - Product ID

**Response:**
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description"
}
```

#### Create Product

```http
POST /products
```

Creates a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description"
}
```

#### Update Product

```http
PUT /products/:id
```

Updates an existing product.

**Parameters:**
- `id` (path parameter) - Product ID

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 149.99,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Product Name",
  "price": 149.99,
  "description": "Updated description"
}
```

#### Delete Product

```http
DELETE /products/:id
```

Deletes a product by ID.

**Parameters:**
- `id` (path parameter) - Product ID

**Response:**
```
Product deleted successfully
```

## Testing with cURL

```bash
# Health checks
curl http://localhost:8000/health
curl http://localhost:8000/health/ready
curl http://localhost:8000/health/live

# Simple health check
curl http://localhost:8000

# Get all products
curl http://localhost:8000/products

# Get product by ID
curl http://localhost:8000/products/1

# Create a product
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":29.99,"description":"A test product"}'

# Update a product
curl -X PUT http://localhost:8000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Product","price":39.99,"description":"Updated description"}'

# Delete a product
curl -X DELETE http://localhost:8000/products/1
```
