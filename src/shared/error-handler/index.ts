import type { Logger } from 'pino';
import {
  AppError,
  DatabaseConnectionError,
  ExtractError,
  LoadError,
  TransformError,
} from '@/shared/errors/index.js';

type ErrorHandlerDeps = {
  logger: Logger;
};

export class ErrorHandler {
  constructor(private readonly deps: ErrorHandlerDeps) {}

  handle(err: unknown): void {
    if (err instanceof DatabaseConnectionError) {
      this.deps.logger.error({ err, code: err.code }, err.message);
      process.exit(1);
    }

    if (err instanceof ExtractError) {
      this.deps.logger.error({ err, code: err.code }, err.message);
      return;
    }

    if (err instanceof TransformError) {
      this.deps.logger.error({ err, code: err.code }, err.message);
      return;
    }

    if (err instanceof LoadError) {
      this.deps.logger.error({ err, code: err.code }, err.message);
      return;
    }

    if (err instanceof AppError) {
      this.deps.logger.error({ err, code: err.code }, err.message);
      return;
    }

    this.deps.logger.error({ err }, 'Erro inesperado');
  }
}
