import type { IStep } from '@/shared/contracts/IStep.js';

type RawProduct = { name: string; price: string };
type Product = { name: string; price: number };
type LoadOutput = { rowCount: number };

type Logger = {
  info: (message: string) => void;
};

type Dependencies = {
  logger: Logger;
  extract: IStep<{ filePath: string }, RawProduct[]>;
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

    const rawData = await extract.execute({ filePath });

    if (rawData.length === 0) {
      logger.info('Não há registros a serem lidos');
      return;
    }

    logger.info(`${rawData.length} de registros a serem lidos`);

    const totalPages = Math.ceil(rawData.length / batchSize);
    let insertBuffer: Product[] = [];

    for (let page = 0; page < totalPages; page++) {
      logger.info(`Página ${page + 1} de ${totalPages} a serem processadas`);

      const chunk = rawData.slice(page * batchSize, (page + 1) * batchSize);
      const transformed = await transform.execute(chunk);

      insertBuffer.push(...transformed);

      if (insertBuffer.length >= insertSize) {
        await load.execute(insertBuffer);
        insertBuffer = [];
      }
    }

    if (insertBuffer.length > 0) {
      await load.execute(insertBuffer);
    }

    logger.info('Registros processados');
  }
}
