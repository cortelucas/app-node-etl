import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { ExtractProducts } from '@/steps/extract/extract-product.js';
import { SendProductsToDatabase } from '@/steps/load/send-products-to-database.js';
import { TransformData } from '@/steps/transform/transform-data.js';
import { ETLRunner } from './etl-runner.js';

const logger = {
  info: (message: string) => console.log(`▶ ${message}`),
};

async function main() {
  logger.info('Iniciando a aplicação');

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const result = await client.query('SELECT NOW()');
  logger.info(`Conexão com Postgres OK: ${result.rows[0].now}`);

  logger.info('Iniciando carga de produtos...');

  const extract = new ExtractProducts({ readFile });
  const transform = new TransformData();
  const load = new SendProductsToDatabase({ db: client });

  const runner = new ETLRunner({
    logger,
    extract,
    transform,
    load,
    filePath: process.env.CSV_PATH ?? 'products.csv',
    batchSize: 1000,
    insertSize: 10000,
  });

  await runner.execute();

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
