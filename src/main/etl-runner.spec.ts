import { describe, expect, it, vi } from 'vitest';
import { ETLRunner } from './etl-runner.js';

const makeSut = () => {
  const loggerMock = {
    info: vi.fn(),
  };

  const extractMock = {
    execute: vi.fn().mockResolvedValue([
      { name: 'Produto A', price: '100.00' },
      { name: 'Produto B', price: '200.00' },
    ]),
  };

  const transformMock = {
    execute: vi.fn().mockResolvedValue([
      { name: 'Produto A', price: 100.0 },
      { name: 'Produto B', price: 200.0 },
    ]),
  };

  const loadMock = {
    execute: vi.fn().mockResolvedValue({ rowCount: 2 }),
  };

  const sut = new ETLRunner({
    logger: loggerMock,
    extract: extractMock,
    transform: transformMock,
    load: loadMock,
    filePath: 'produtos.csv',
    batchSize: 1000,
    insertSize: 2,
  });

  return { sut, loggerMock, extractMock, transformMock, loadMock };
};

describe('ETLRunner', () => {
  it('deve logar que não há registros quando o CSV estiver vazio', async () => {
    const { sut, loggerMock, extractMock } = makeSut();
    extractMock.execute.mockResolvedValue([]);

    await sut.execute();

    expect(loggerMock.info).toHaveBeenCalledWith(
      'Não há registros a serem lidos',
    );
  });

  it('deve logar a quantidade de registros encontrados', async () => {
    const { sut, loggerMock } = makeSut();

    await sut.execute();

    expect(loggerMock.info).toHaveBeenCalledWith(
      '2 de registros a serem lidos',
    );
  });

  it('deve chamar o transform para cada página', async () => {
    const { sut, transformMock } = makeSut();

    await sut.execute();

    expect(transformMock.execute).toHaveBeenCalled();
  });

  it('deve chamar o load ao atingir o insertSize', async () => {
    const { sut, loadMock } = makeSut();

    await sut.execute();

    expect(loadMock.execute).toHaveBeenCalled();
  });

  it('deve logar registros processados ao final', async () => {
    const { sut, loggerMock } = makeSut();

    await sut.execute();

    expect(loggerMock.info).toHaveBeenCalledWith('Registros processados');
  });
});
