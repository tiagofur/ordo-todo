export interface UseCase<IN, OUT> {
  execute(data: IN, loggedUser?: any): Promise<OUT>;
}
