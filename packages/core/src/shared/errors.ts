export class DomainError extends Error {
  constructor(message: string, public readonly code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(message: string = 'User already exists') {
    super(message, 'USER_ALREADY_EXISTS');
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'INVALID_CREDENTIALS');
  }
}
