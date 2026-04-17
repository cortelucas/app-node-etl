export interface IStep<TInput = void, TOutput = void> {
  execute(input: TInput): Promise<TOutput>;
}

export interface IStreamStep<TInput = void, TOutput = void> {
  execute(
    input: TInput,
    onBatch: (batch: TOutput) => Promise<void>,
  ): Promise<void>;
}
