import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto, ProductListResponseDto } from './dto/product-response.dto';

export const createProductSwagger = {
  operation: { summary: 'Create a new product' },
  body: {
    type: CreateProductDto,
    examples: {
      default: {
        summary: 'Sample product',
        value: {
          name: 'Premium subscription',
          price: 99.9,
        },
      },
    },
  },
  createdResponse: {
    description: 'Product created successfully',
    type: ProductDto,
    schema: {
      example: {
        id: 1,
        name: 'Premium subscription',
        price: '99.90',
        created_at: '2024-01-01T12:00:00.000Z',
      },
    },
  },
  badRequest: { description: 'Invalid payload' },
};

export const deleteProductSwagger = {
  operation: { summary: 'Delete product by id' },
  param: { name: 'id', example: 1, description: 'Product identifier' },
  okResponse: {
    description: 'Product deleted successfully',
    type: ProductDto,
    schema: {
      example: {
        id: 1,
        name: 'Premium subscription',
        price: '99.90',
        created_at: '2024-01-01T12:00:00.000Z',
      },
    },
  },
  notFound: { description: 'Product not found' },
};

export const listProductsSwagger = {
  operation: { summary: 'List products with pagination' },
  pageQuery: { name: 'page', required: false, example: 1 },
  limitQuery: { name: 'limit', required: false, example: 10 },
  okResponse: {
    description: 'Paginated list of products',
    type: ProductListResponseDto,
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: 'Premium subscription',
            price: '99.90',
            created_at: '2024-01-01T12:00:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
        },
      },
    },
  },
};
