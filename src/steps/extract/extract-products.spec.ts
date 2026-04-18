import { describe, expect, it, vi } from 'vitest';
import { LoadError } from '@/shared/errors/index.js';
import { SendProductsToDatabase } from '../load/send-products-to-database.js';

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

  it('deve lançar LoadError quando a query falhar', async () => {
    const { sut, dbMock } = makeSut();

    dbMock.query.mockRejectedValueOnce(new Error('query error'));

    await expect(
      sut.execute([{ name: 'Produto A', price: 100 }]),
    ).rejects.toBeInstanceOf(LoadError);
  });

  it('deve deduplicar produtos com o mesmo nome antes de inserir', async () => {
    const { sut, dbMock } = makeSut();

    await sut.execute([
      { name: 'Produto A', price: 100 },
      { name: 'Produto A', price: 200 },
    ]);

    const callArgs = dbMock.query.mock.calls[0];
    const sql = callArgs[0] as string;
    const params = callArgs[1] as unknown[];

    expect(params).toHaveLength(2);
    expect(sql).toContain('ON CONFLICT');
  });
});
