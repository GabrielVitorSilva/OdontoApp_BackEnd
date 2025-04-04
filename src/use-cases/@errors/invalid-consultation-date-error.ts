export class InvalidConsultationDateError extends Error {
  constructor() {
    super('A data da consulta deve ser futura.')
  }
}
