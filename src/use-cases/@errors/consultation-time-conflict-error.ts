export class ConsultationTimeConflictError extends Error {
  constructor() {
    super('Existe uma consulta agendada que se sobrepõe ao horário desejado.')
  }
}
