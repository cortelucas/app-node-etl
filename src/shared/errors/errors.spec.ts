import { describe, expect, it } from 'vitest';
import {
  AppError,
  DatabaseConnectionError,
  EnvValidationError,
  ExtractError,
  LoadError,
  TransformError,
} from './index.js';

describe('Errors', () => {
  it('AppError deve ter name, code e message corretos', () => {
    const err = new AppError('mensagem', 'CODE');
    expect(err.name).toBe('AppError');
    expect(err.code).toBe('CODE');
    expect(err.message).toBe('mensagem');
  });

  it('ExtractError deve ter name e code corretos', () => {
    const err = new ExtractError();
    expect(err.name).toBe('ExtractError');
    expect(err.code).toBe('EXTRACT_ERROR');
  });

  it('TransformError deve ter name e code corretos', () => {
    const err = new TransformError();
    expect(err.name).toBe('TransformError');
    expect(err.code).toBe('TRANSFORM_ERROR');
  });

  it('LoadError deve ter name e code corretos', () => {
    const err = new LoadError();
    expect(err.name).toBe('LoadError');
    expect(err.code).toBe('LOAD_ERROR');
  });

  it('DatabaseConnectionError deve ter name e code corretos', () => {
    const err = new DatabaseConnectionError();
    expect(err.name).toBe('DatabaseConnectionError');
    expect(err.code).toBe('DB_CONNECTION_ERROR');
  });

  it('EnvValidationError deve ter name e code corretos', () => {
    const err = new EnvValidationError();
    expect(err.name).toBe('EnvValidationError');
    expect(err.code).toBe('ENV_VALIDATION_ERROR');
  });
});
