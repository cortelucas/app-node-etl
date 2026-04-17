export interface IStep<TInput = void, TOutput = void> {
  execute(input: TInput): Promise<TOutput>;
}
