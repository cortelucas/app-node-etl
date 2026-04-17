import type { IStep, IStreamStep } from '@/shared/contracts/IStep.js';

type RawProduct = { name: string; price: string };
type Product = { name: string; price: number };
type LoadOutput = { inserted: number; updated: number };

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

    const startTime = Date.now();
    let totalRecords = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    const insertBuffer: Product[] = [];

    await extract.execute({ filePath, batchSize }, async (batch) => {
      totalRecords += batch.length;

      const transformed = await transform.execute(batch);
      insertBuffer.push(...transformed);

      if (insertBuffer.length >= insertSize) {
        const toInsert = insertBuffer.splice(0, insertSize);
        const { inserted, updated } = await load.execute(toInsert);
        totalInserted += inserted;
        totalUpdated += updated;
        logger.info(`${totalRecords} registros lidos e processados`);
      }
    });

    if (insertBuffer.length > 0) {
      const { inserted, updated } = await load.execute(insertBuffer);
      totalInserted += inserted;
      totalUpdated += updated;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.info(`${totalRecords} de registros lidos`);
    logger.info(`${totalInserted} inseridos | ${totalUpdated} atualizados`);
    logger.info(`Concluído em ${elapsed}s`);
    logger.info('Registros processados');
  }
}
