import { describe, expect, it, vi } from 'vitest';
import { TransformError } from '@/shared/errors/index.js';
import { TransformData } from './transform-data.js';

const makeSut = () => {
  const sut = new TransformData();
  return { sut };
};

describe('TransformData', () => {
  it('deve transformar os dados brutos em produtos formatados', async () => {
    const { sut } = makeSut();

    const result = await sut.execute([
      { name: 'Impedit nostrum', price: '586.83' },
      { name: 'Hic molestiae', price: '343.61' },
    ]);

    expect(result).toEqual([
      { name: 'Impedit nostrum', price: 586.83 },
      { name: 'Hic molestiae', price: 343.61 },
    ]);
  });

  it('deve retornar array vazio se não houver dados', async () => {
    const { sut } = makeSut();

    const result = await sut.execute([]);

    expect(result).toEqual([]);
  });

  it('deve ignorar registros com price inválido', async () => {
    const { sut } = makeSut();

    const result = await sut.execute([
      { name: 'Produto válido', price: '100.00' },
      { name: 'Produto inválido', price: 'abc' },
    ]);

    expect(result).toEqual([{ name: 'Produto válido', price: 100.0 }]);
  });

  it('deve lançar TransformError quando ocorrer erro inesperado', async () => {
    const { sut } = makeSut();

    vi.spyOn(Array.prototype, 'reduce').mockImplementationOnce(() => {
      throw new Error('erro inesperado');
    });

    await expect(
      sut.execute([{ name: 'Produto A', price: '100.00' }]),
    ).rejects.toBeInstanceOf(TransformError);
  });
});
