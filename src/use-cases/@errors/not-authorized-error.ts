export class NotAuthorizedError extends Error {
  constructor() {
    super('Não autorizado.')
  }
}
