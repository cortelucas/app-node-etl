import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { ExtractProducts } from './extract-product.js';

const makeSut = (csvContent: string) => {
  const createReadStreamMock = vi
    .fn()
    .mockReturnValue(Readable.from([csvContent]));

  const sut = new ExtractProducts({ createReadStream: createReadStreamMock });

  return { sut, createReadStreamMock };
};

describe('ExtractProducts', () => {
  it('deve emitir um batch com os produtos do CSV', async () => {
    const { sut } = makeSut(
      'name,price\nImpedit nostrum,586.83\nHic molestiae,343.61',
    );

    const batches: unknown[] = [];

    await sut.execute(
      { filePath: 'produtos.csv', batchSize: 1000 },
      async (batch) => {
        batches.push(...batch);
      },
    );

    expect(batches).toEqual([
      { name: 'Impedit nostrum', price: '586.83' },
      { name: 'Hic molestiae', price: '343.61' },
    ]);
  });

  it('deve retornar nenhum batch se o CSV estiver vazio', async () => {
    const { sut } = makeSut('name,price\n');

    const batches: unknown[] = [];

    await sut.execute(
      { filePath: 'produtos.csv', batchSize: 1000 },
      async (batch) => {
        batches.push(...batch);
      },
    );

    expect(batches).toEqual([]);
  });

  it('deve chamar o createReadStream com o caminho correto', async () => {
    const { sut, createReadStreamMock } = makeSut('name,price\n');

    await sut.execute(
      { filePath: 'produtos.csv', batchSize: 1000 },
      async () => {},
    );

    expect(createReadStreamMock).toHaveBeenCalledWith('produtos.csv');
  });
});
