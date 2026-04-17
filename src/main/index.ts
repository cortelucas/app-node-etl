import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import cron from 'node-cron';
import pg from 'pg';
import { env } from '@/shared/env/index.js';
import { logger } from '@/shared/logger/index.js';
import { ExtractProducts } from '@/steps/extract/extract-product.js';
import { SendProductsToDatabase } from '@/steps/load/send-products-to-database.js';
import { TransformData } from '@/steps/transform/transform-data.js';
import { ETLRunner } from './etl-runner.js';

async function runETL(client: pg.Client) {
  const extract = new ExtractProducts({ createReadStream });
  const transform = new TransformData();
  const load = new SendProductsToDatabase({ db: client });

  const runner = new ETLRunner({
    logger,
    extract,
    transform,
    load,
    filePath: env.CSV_PATH,
    batchSize: 1000,
    insertSize: 10000,
  });

  await runner.execute();
}

async function main() {
  logger.info('Iniciando a aplicação');

  const client = new pg.Client({
    connectionString: env.DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    logger.info(`Conexão com Postgres OK: ${result.rows[0].now}`);
  } catch (err) {
    logger.error({ err }, 'Falha ao conectar no Postgres');
    process.exit(1);
  }

  logger.info('Iniciando carga de produtos...');

  try {
    await runETL(client);
  } catch (err) {
    logger.error({ err }, 'Falha durante a execução do ETL');
  }

  let isRunning = false;

  cron.schedule('0 0 * * 1', async () => {
    if (isRunning) {
      logger.warn('ETL já está em execução, disparo ignorado');
      return;
    }

    try {
      isRunning = true;
      logger.info('Iniciando carga de produtos...');
      await runETL(client);
    } catch (err) {
      logger.error({ err }, 'Falha durante a execução agendada do ETL');
    } finally {
      isRunning = false;
    }
  });

  logger.info('Agendamento ativo: toda segunda-feira às 00:00');
}

main();
