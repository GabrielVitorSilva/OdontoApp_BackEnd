export class InvalidCredentialsError extends Error {
  constructor() {
    super('E-mail ou senha não conferem.')
  }
}
