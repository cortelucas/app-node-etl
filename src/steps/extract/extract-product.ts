import type { IStep } from '@/shared/contracts/IStep.js';

type ReadFileFn = (path: string, encoding: string) => Promise<string>;

type Input = {
  filePath: string;
};

type RawProduct = {
  name: string;
  price: string;
};

type Dependencies = {
  readFile: ReadFileFn;
};

export class ExtractProducts implements IStep<Input, RawProduct[]> {
  constructor(private dependencies: Dependencies) {}

  async execute({ filePath }: Input): Promise<RawProduct[]> {
    const content = await this.dependencies.readFile(filePath, 'utf-8');

    const [_header, ...lines] = content.split('\n');

    return lines
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [name, price] = line.split(',');
        return { name, price };
      });
  }
}
