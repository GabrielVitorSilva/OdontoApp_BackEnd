export class ResourceNotFoundError extends Error {
  constructor() {
    super('Usuário não encontrado.')
  }
}
