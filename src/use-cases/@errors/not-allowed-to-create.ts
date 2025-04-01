export class NotAllowedToCreate extends Error {
  constructor() {
    super('Você não tem permissão para cadastrar esse tipo de usuário.')
  }
}
