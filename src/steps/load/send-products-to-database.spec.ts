import { describe, expect, it, vi } from 'vitest';
import { SendProductsToDatabase } from './send-products-to-database.js';

type Product = { name: string; price: number };

const makeSut = () => {
  const dbMock = {
    query: vi.fn().mockResolvedValue({
      rowCount: 2,
      rows: [{ xmax: '0' }, { xmax: '123' }],
    }),
  };

  const sut = new SendProductsToDatabase({ db: dbMock });

  return { sut, dbMock };
};

describe('SendProductsToDatabase', () => {
  it('deve inserir os produtos no banco com upsert', async () => {
    const { sut, dbMock } = makeSut();

    const products: Product[] = [
      { name: 'Impedit nostrum', price: 586.83 },
      { name: 'Hic molestiae', price: 343.61 },
    ];

    await sut.execute(products);

    expect(dbMock.query).toHaveBeenCalledOnce();
  });

  it('deve retornar inserted e updated corretamente', async () => {
    const { sut } = makeSut();

    const products: Product[] = [
      { name: 'Impedit nostrum', price: 586.83 },
      { name: 'Hic molestiae', price: 343.61 },
    ];

    const result = await sut.execute(products);

    expect(result).toEqual({ inserted: 1, updated: 1 });
  });

  it('deve retornar zeros se o array estiver vazio', async () => {
    const { sut, dbMock } = makeSut();
    dbMock.query.mockResolvedValue({ rowCount: 0, rows: [] });

    const result = await sut.execute([]);

    expect(result).toEqual({ inserted: 0, updated: 0 });
  });
});
