export class UserAlreadyExistsError extends Error {
  constructor() {
    super('email ou cpf já cadastrados.')
  }
}
