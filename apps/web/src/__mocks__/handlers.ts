import { HttpResponse, http } from 'msw';

const API_BASE_URL = 'http://localhost:8000';
const API_VERSION = 'v1';
const API_VERSIONED_BASE_URL = `${API_BASE_URL}/${API_VERSION}`;

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    description: 'Test description 1',
    price: 99.99,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Test Product 2',
    description: 'Test description 2',
    price: 149.99,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const handlers = [
  http.get(`${API_VERSIONED_BASE_URL}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: 123456,
    });
  }),

  http.get(`${API_VERSIONED_BASE_URL}/health/database`, () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  }),

  http.post(`${API_VERSIONED_BASE_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      user: {
        ...mockUser,
        email: body.email as string,
        username: body.username as string,
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  }),

  http.post(`${API_VERSIONED_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.email === 'wrong@example.com') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({
      user: mockUser,
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  }),

  http.post(`${API_VERSIONED_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'mock-new-access-token',
    });
  }),

  http.post(`${API_VERSIONED_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get(`${API_VERSIONED_BASE_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockUser);
  }),

  http.get(`${API_VERSIONED_BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    return HttpResponse.json({
      data: mockProducts,
      meta: {
        total: mockProducts.length,
        page,
        limit,
        totalPages: 1,
      },
    });
  }),

  http.get(`${API_VERSIONED_BASE_URL}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  http.post(`${API_VERSIONED_BASE_URL}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newProduct = {
      id: String(mockProducts.length + 1),
      name: body.name as string,
      description: body.description as string,
      price: body.price as number,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  http.put(`${API_VERSIONED_BASE_URL}/products/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    const updatedProduct = {
      ...product,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updatedProduct);
  }),

  http.delete(`${API_VERSIONED_BASE_URL}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return HttpResponse.json({ message: 'Product deleted successfully' });
  }),
];
