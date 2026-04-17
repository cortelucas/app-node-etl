import type { IStep } from '@/shared/contracts/IStep.js';

type Product = {
  name: string;
  price: number;
};

type DbClient = {
  query: (sql: string, params?: unknown[]) => Promise<{ rowCount: number }>;
};

type Dependencies = {
  db: DbClient;
};

type Output = {
  rowCount: number;
};

export class SendProductsToDatabase implements IStep<Product[], Output> {
  constructor(private readonly deps: Dependencies) {}

  async execute(input: Product[]): Promise<Output> {
    if (input.length === 0) {
      return { rowCount: 0 };
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
    `;

    const result = await this.deps.db.query(sql, params);

    return { rowCount: result.rowCount };
  }
}
