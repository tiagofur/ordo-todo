export interface LoggedUser {
  id: string;
  email: string;
  role: string;
}

export interface UseCase<IN, OUT> {
  execute(data: IN, loggedUser?: LoggedUser): Promise<OUT>;
}
