import { describe, expect, it } from 'vitest';
import { TransformData } from './transform-data.js';

const makeSut = () => {
  const sut = new TransformData();
  return { sut };
};

describe('TransformData', () => {
  // deve transformar os dados brutos em produtos formatados
  it('should transform raw data into formatted products', async () => {
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

  // deve retornar array vazio se não houver dados
  it('should return an empty array if there is no data', async () => {
    const { sut } = makeSut();

    const result = await sut.execute([]);

    expect(result).toEqual([]);
  });

  // deve ignorar registros com price inválido
  it('', async () => {
    const { sut } = makeSut();

    const result = await sut.execute([
      { name: 'Produto válido', price: '100.00' },
      { name: 'Produto inválido', price: 'abc' },
    ]);

    expect(result).toEqual([{ name: 'Produto válido', price: 100.0 }]);
  });
});
