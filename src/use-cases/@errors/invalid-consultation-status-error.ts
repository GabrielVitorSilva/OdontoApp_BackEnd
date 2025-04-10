export class InvalidConsultationStatusError extends Error {
  constructor() {
    super('Apenas consultas marcadas como SCHEDULED podem ser atualizadas')
  }
}
