export class ProfessionalNotLinkedToTreatmentError extends Error {
  constructor() {
    super('Profissional não está vinculado a este tratamento.')
  }
}
