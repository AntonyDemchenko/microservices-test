import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { createdCounter, deletedCounter } from '../metrics.service';
import { SqsService } from '../sqs.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly sqsService: SqsService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const result = await this.pool.query(
      'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
      [dto.name, dto.price],
    );
    const product = result.rows[0];
    createdCounter.inc();
    await this.sqsService.sendMessage('product.created', product);
    return product;
  }

  async deleteProduct(id: number) {
    const result = await this.pool.query(
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

  async getProducts(page = 1, limit = 10) {
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10));
    const offset = (pageNumber - 1) * limitNumber;

    const [itemsResult, totalResult] = await Promise.all([
      this.pool.query(
        'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limitNumber, offset],
      ),
      this.pool.query('SELECT COUNT(*) FROM products'),
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
