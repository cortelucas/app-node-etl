import { readFile } from 'node:fs/promises';
import cron from 'node-cron';
import pg from 'pg';
import { ExtractProducts } from '@/steps/extract/extract-product.js';
import { SendProductsToDatabase } from '@/steps/load/send-products-to-database.js';
import { TransformData } from '@/steps/transform/transform-data.js';
import { ETLRunner } from './etl-runner.js';

const logger = {
  info: (message: string) => console.log(`▶ ${message}`),
};

async function runETL(client: pg.Client) {
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
}

async function main() {
  logger.info('Iniciando a aplicação');

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const result = await client.query('SELECT NOW()');
  logger.info(`Conexão com Postgres OK: ${result.rows[0].now}`);

  // roda imediatamente na primeira vez
  logger.info('Iniciando carga de produtos...');
  await runETL(client);

  // agendamento: toda segunda-feira às 00:00
  // formato: segundo minuto hora dia mês dia-da-semana
  let isRunning = false;

  cron.schedule('0 0 * * 1', async () => {
    if (isRunning) {
      logger.info('ETL já está em execução, disparo ignorado');
      return;
    }

    try {
      isRunning = true;
      logger.info('Iniciando carga de produtos...');
      await runETL(client);
    } finally {
      isRunning = false;
    }
  });

  logger.info('Agendamento ativo: toda segunda-feira às 00:00');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
