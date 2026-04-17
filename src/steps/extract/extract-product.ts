import type { ReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import type { IStreamStep } from '@/shared/contracts/IStep.js';
import { ExtractError } from '@/shared/errors/index.js';

type Input = {
  filePath: string;
  batchSize: number;
};

export type RawProduct = {
  name: string;
  price: string;
};

type Dependencies = {
  createReadStream: (path: string) => ReadStream | NodeJS.ReadableStream;
};

export class ExtractProducts implements IStreamStep<Input, RawProduct[]> {
  constructor(private readonly deps: Dependencies) {}

  async execute(
    { filePath, batchSize }: Input,
    onBatch: (batch: RawProduct[]) => Promise<void>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const batch: RawProduct[] = [];

      const parser = this.deps.createReadStream(filePath).pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }),
      );

      parser.on('data', async (row: RawProduct) => {
        batch.push(row);

        if (batch.length >= batchSize) {
          parser.pause();
          const chunk = batch.splice(0, batchSize);

          try {
            await onBatch(chunk);
          } catch (err) {
            reject(new ExtractError(err));
          }

          parser.resume();
        }
      });

      parser.on('end', async () => {
        try {
          if (batch.length > 0) {
            await onBatch(batch);
          }
          resolve();
        } catch (err) {
          reject(new ExtractError(err));
        }
      });

      parser.on('error', (err) => reject(new ExtractError(err)));
    });
  }
}
