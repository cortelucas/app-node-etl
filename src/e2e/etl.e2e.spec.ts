import { Readable } from 'node:stream';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ETLRunner } from '@/main/etl-runner.js';
import { ExtractProducts } from '@/steps/extract/extract-product.js';
import { SendProductsToDatabase } from '@/steps/load/send-products-to-database.js';
import { TransformData } from '@/steps/transform/transform-data.js';

const logger = {
  info: () => {},
  error: () => {},
};

const CSV_CONTENT = `name,price
Produto A,100.00
Produto B,200.00
Produto C,300.00`;

const makeSut = (client: pg.Client) => {
  const createReadStream = () => Readable.from([CSV_CONTENT]);

  const extract = new ExtractProducts({ createReadStream });
  const transform = new TransformData();
  const load = new SendProductsToDatabase({ db: client });

  const sut = new ETLRunner({
    logger,
    extract,
    transform,
    load,
    filePath: 'fake.csv',
    batchSize: 1000,
    insertSize: 10000,
  });

  return { sut };
};

describe('ETL E2E', () => {
  let container: StartedPostgreSqlContainer;
  let client: pg.Client;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('etl_test')
      .withUsername('test')
      .withPassword('test')
      .start();

    client = new pg.Client({
      connectionString: container.getConnectionUri(),
    });

    await client.connect();

    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE products ADD CONSTRAINT unique_product_name UNIQUE (name);
    `);
  }, 60000);

  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  it('deve inserir os produtos no banco corretamente', async () => {
    const { sut } = makeSut(client);

    await sut.execute();

    const result = await client.query('SELECT * FROM products ORDER BY name');

    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].name).toBe('Produto A');
    expect(Number(result.rows[0].price)).toBe(100);
    expect(result.rows[1].name).toBe('Produto B');
    expect(result.rows[2].name).toBe('Produto C');
  }, 60000);

  it('deve atualizar o preço de um produto já existente', async () => {
    const { sut } = makeSut(client);

    await sut.execute();

    const result = await client.query(
      'SELECT price FROM products WHERE name = $1',
      ['Produto A'],
    );

    expect(Number(result.rows[0].price)).toBe(100);
  }, 60000);

  it('deve retornar inseridos e atualizados corretamente na segunda execução', async () => {
    const load = new SendProductsToDatabase({ db: client });

    const result = await load.execute([
      { name: 'Produto A', price: 150 },
      { name: 'Produto Novo', price: 999 },
    ]);

    expect(result.inserted).toBe(1);
    expect(result.updated).toBe(1);
  }, 60000);
});
