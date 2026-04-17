import { describe, expect, it, vi } from 'vitest';
import { SendProductsToDatabase } from './send-products-to-database.js';

type Product = { name: string; price: number };

const makeSut = () => {
  const dbMock = {
    query: vi.fn().mockResolvedValue({ rowCount: 2 }),
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

  it('deve retornar o rowCount da inserção', async () => {
    const { sut } = makeSut();

    const products: Product[] = [
      { name: 'Impedit nostrum', price: 586.83 },
      { name: 'Hic molestiae', price: 343.61 },
    ];

    const result = await sut.execute(products);

    expect(result).toEqual({ rowCount: 2 });
  });

  it('deve retornar rowCount 0 se o array estiver vazio', async () => {
    const { sut, dbMock } = makeSut();
    dbMock.query.mockResolvedValue({ rowCount: 0 });

    const result = await sut.execute([]);

    expect(result).toEqual({ rowCount: 0 });
  });
});
