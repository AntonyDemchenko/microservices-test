import { Pool, PoolConfig } from 'pg';
import { ProductsService } from './products.service';
import { SqsService } from '../sqs.service';

describe('ProductsService (integration)', () => {
  let pool: Pool;
  let service: ProductsService;
  let sqsService: Pick<SqsService, 'sendMessage'>; // беремо лише потрібний метод

  beforeAll(() => {
    const connectionString =
      process.env.TEST_DATABASE_URL ??
      process.env.DATABASE_URL ??
      'postgres://postgres:root@localhost:5432/legaltech_test';

    const poolConfig: PoolConfig = { connectionString };
    pool = new Pool(poolConfig);

    // створюємо частковий мок тільки для sendMessage
    sqsService = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
    };

    service = new ProductsService(pool as any, sqsService as SqsService);
  });

  beforeEach(async () => {
    (sqsService.sendMessage as jest.Mock).mockClear();
    await pool.query('TRUNCATE products RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('createProduct inserts a product into the database', async () => {
    const product = await service.createProduct({
      name: 'Test product',
      price: 42.5,
    });

    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [
      product.id,
    ]);

    expect(rows[0]).toMatchObject({
      id: product.id,
      name: 'Test product',
      price: product.price,
    });

    expect(sqsService.sendMessage).toHaveBeenCalledWith(
      'product.created',
      expect.any(Object),
    );
  });

  it('getProducts returns paginated data', async () => {
    await service.createProduct({ name: 'First', price: 10 });
    await service.createProduct({ name: 'Second', price: 20 });
    await service.createProduct({ name: 'Third', price: 30 });

    const result = await service.getProducts(2, 1);

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ page: 2, limit: 1, total: 3 });
  });

  it('deleteProduct removes an existing product', async () => {
    const product = await service.createProduct({
      name: 'Delete me',
      price: 15,
    });

    await service.deleteProduct(product.id);

    const { rowCount } = await pool.query(
      'SELECT 1 FROM products WHERE id = $1',
      [product.id],
    );
    expect(rowCount).toBe(0);

    expect(sqsService.sendMessage).toHaveBeenCalledWith(
      'product.deleted',
      expect.any(Object),
    );
  });
});
