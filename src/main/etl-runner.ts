import type { IStep, IStreamStep } from '@/shared/contracts/IStep.js';

type RawProduct = { name: string; price: string };
type Product = { name: string; price: number };
type LoadOutput = { rowCount: number };

type Logger = {
  info: (message: string) => void;
  error: (obj: unknown, message: string) => void;
};

type Dependencies = {
  logger: Logger;
  extract: IStreamStep<{ filePath: string; batchSize: number }, RawProduct[]>;
  transform: IStep<RawProduct[], Product[]>;
  load: IStep<Product[], LoadOutput>;
  filePath: string;
  batchSize: number;
  insertSize: number;
};

export class ETLRunner {
  constructor(private readonly deps: Dependencies) {}

  async execute(): Promise<void> {
    const {
      logger,
      extract,
      transform,
      load,
      filePath,
      batchSize,
      insertSize,
    } = this.deps;

    let totalRecords = 0;
    const insertBuffer: Product[] = [];

    await extract.execute({ filePath, batchSize }, async (batch) => {
      totalRecords += batch.length;

      if (totalRecords === batch.length) {
        logger.info(`Iniciando leitura em stream...`);
      }

      const transformed = await transform.execute(batch);
      insertBuffer.push(...transformed);

      if (insertBuffer.length >= insertSize) {
        const toInsert = insertBuffer.splice(0, insertSize);
        await load.execute(toInsert);
        logger.info(`${totalRecords} registros lidos e processados`);
      }
    });

    if (insertBuffer.length > 0) {
      await load.execute(insertBuffer);
    }

    logger.info(`${totalRecords} de registros lidos`);
    logger.info('Registros processados');
  }
}
