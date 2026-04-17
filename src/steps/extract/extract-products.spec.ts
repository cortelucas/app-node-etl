import { describe, expect, it, vi } from 'vitest';
import { ExtractProducts } from './extract-product.js';

const makeSut = (csvContent: string) => {
  const readFileMock = vi.fn().mockResolvedValue(csvContent);
  const sut = new ExtractProducts({ readFile: readFileMock });

  return { sut, readFileMock };
};

describe('ExtractProducts', () => {
  // deve retornar uma lista de produtos brutos do CSV
  it('should return a list of raw products from the CSV', async () => {
    const { sut } = makeSut(
      'name,price\nImpedit nostrum,586.83\nHic molestiae,343.61',
    );

    const result = await sut.execute({ filePath: 'produtos.csv' });

    expect(result).toEqual([
      { name: 'Impedit nostrum', price: '586.83' },
      { name: 'Hic molestiae', price: '343.61' },
    ]);
  });

  // deve retornar array vazio se o CSV estiver vazio
  it('should return an empty array if the CSV is empty', async () => {
    const { sut, readFileMock } = makeSut('name,price\n');

    await sut.execute({ filePath: 'produtos.csv' });

    expect(readFileMock).toHaveBeenCalledWith('produtos.csv', 'utf-8');
  });

  // deve chamar o readFile com o caminho correto
  it('should call readFile with the correct path', async () => {
    const { sut, readFileMock } = makeSut('name,price\n');

    await sut.execute({ filePath: 'produtos.csv' });

    expect(readFileMock).toHaveBeenCalledWith('produtos.csv', 'utf-8');
  });
});
