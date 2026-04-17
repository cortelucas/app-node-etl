import type { IStep } from '@/shared/contracts/IStep.js';
import { LoadError } from '@/shared/errors/index.js';

type Product = {
  name: string;
  price: number;
};

type DbClient = {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rowCount: number; rows: { xmax: string }[] }>;
};

type Dependencies = {
  db: DbClient;
};

type Output = {
  inserted: number;
  updated: number;
};

export class SendProductsToDatabase implements IStep<Product[], Output> {
  constructor(private readonly deps: Dependencies) {}

  async execute(input: Product[]): Promise<Output> {
    if (input.length === 0) {
      return { inserted: 0, updated: 0 };
    }

    const unique = Array.from(
      input
        .reduce((map, product) => {
          map.set(product.name, product);
          return map;
        }, new Map<string, Product>())
        .values(),
    );

    const values = unique
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(', ');

    const params = unique.flatMap((p) => [p.name, p.price]);

    const sql = `
      INSERT INTO products (name, price)
      VALUES ${values}
      ON CONFLICT (name)
      DO UPDATE SET price = EXCLUDED.price
      RETURNING xmax
    `;

    try {
      const result = await this.deps.db.query(sql, params);

      const inserted = result.rows.filter((r) => r.xmax === '0').length;
      const updated = result.rows.filter((r) => r.xmax !== '0').length;

      return { inserted, updated };
    } catch (err) {
      throw new LoadError(err);
    }
  }
}
