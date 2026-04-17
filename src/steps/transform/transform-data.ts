import type { IStep } from '@/shared/contracts/IStep.js';

type RawProduct = {
  name: string;
  price: string;
};

type Product = {
  name: string;
  price: number;
};

export class TransformData implements IStep<RawProduct[], Product[]> {
  async execute(input: RawProduct[]): Promise<Product[]> {
    return input.reduce<Product[]>((acc, item) => {
      const price = parseFloat(item.price);

      if (Number.isNaN(price)) return acc;

      acc.push({ name: item.name, price });

      return acc;
    }, []);
  }
}
