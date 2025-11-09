import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { createdCounter, deletedCounter } from '../metrics.service';
import { SqsService } from '../sqs.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, ProductListResponse } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly sqsService: SqsService,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    try {
      const existing = await this.pool.query<Product>(
        'SELECT * FROM products WHERE LOWER(name) = LOWER($1)',
        [dto.name],
      );

      if (existing.rows.length > 0) {
        throw new ConflictException(
          `Product with name "${dto.name}" already exists`,
        );
      }

      const result = await this.pool.query<Product>(
        'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
        [dto.name, dto.price],
      );

      const product = result.rows[0];

      createdCounter.inc();

      await this.sqsService.sendMessage('product.created', product);

      return product;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code?: string };
        if (err.code === '23505') {
          throw new ConflictException(
            `Product with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<Product> {
    const result = await this.pool.query<Product>(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id],
    );
    const product = result.rows[0];
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    deletedCounter.inc();
    await this.sqsService.sendMessage('product.deleted', product);
    return product;
  }

  async getProducts(page = 1, limit = 10): Promise<ProductListResponse> {
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10));
    const offset = (pageNumber - 1) * limitNumber;

    const [itemsResult, totalResult] = await Promise.all([
      this.pool.query<Product>(
        'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limitNumber, offset],
      ),
      this.pool.query<{ count: string }>('SELECT COUNT(*) FROM products'),
    ]);

    return {
      data: itemsResult.rows,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total: Number(totalResult.rows[0].count),
      },
    };
  }
}
