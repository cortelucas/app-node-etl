export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ExtractError extends AppError {
  constructor(cause?: unknown) {
    super('Falha ao extrair dados do CSV', 'EXTRACT_ERROR', cause);
    this.name = 'ExtractError';
  }
}

export class TransformError extends AppError {
  constructor(cause?: unknown) {
    super('Falha ao transformar os dados', 'TRANSFORM_ERROR', cause);
    this.name = 'TransformError';
  }
}

export class LoadError extends AppError {
  constructor(cause?: unknown) {
    super('Falha ao inserir dados no banco', 'LOAD_ERROR', cause);
    this.name = 'LoadError';
  }
}

export class DatabaseConnectionError extends AppError {
  constructor(cause?: unknown) {
    super('Falha ao conectar no banco de dados', 'DB_CONNECTION_ERROR', cause);
    this.name = 'DatabaseConnectionError';
  }
}

export class EnvValidationError extends AppError {
  constructor(cause?: unknown) {
    super('Variáveis de ambiente inválidas', 'ENV_VALIDATION_ERROR', cause);
    this.name = 'EnvValidationError';
  }
}
