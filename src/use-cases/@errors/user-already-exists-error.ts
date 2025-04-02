export class UserAlreadyExistsError extends Error {
  constructor() {
    super('E-mail ou CPF já está sendo usado.')
  }
}
