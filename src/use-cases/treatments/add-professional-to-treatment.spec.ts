import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { AddProfessionalToTreatmentUseCase } from './add-professional-to-treatment'
import { expect, describe, it, beforeEach } from 'vitest'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: AddProfessionalToTreatmentUseCase

describe('Add Professional To Treatment Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new AddProfessionalToTreatmentUseCase(treatmentsRepository)
  })

  it('should be able to add a professional to a treatment', async () => {
    const treatment = await treatmentsRepository.create({
      name: 'Limpeza',
      description: 'Limpeza dos dentes',
      durationMinutes: 30,
      price: 100,
    })

    const { treatment: updatedTreatment } = await sut.execute({
      treatmentId: treatment.id,
      professionalId: 'professional-1',
    })

    expect(updatedTreatment.id).toBe(treatment.id)
    expect(updatedTreatment.name).toBe('Limpeza')
    expect(updatedTreatment.description).toBe('Limpeza dos dentes')
    expect(updatedTreatment.durationMinutes).toBe(30)
    expect(updatedTreatment.price).toBe(100)
  })
})
