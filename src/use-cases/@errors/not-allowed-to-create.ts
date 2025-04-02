export class NotAllowedToCreate extends Error {
  constructor() {
    super('Não autorizado a criar este recurso.')
  }
}
