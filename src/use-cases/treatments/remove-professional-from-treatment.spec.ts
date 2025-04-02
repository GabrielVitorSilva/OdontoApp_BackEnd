import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { RemoveProfessionalFromTreatmentUseCase } from './remove-professional-from-treatment'
import { expect, describe, it, beforeEach } from 'vitest'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: RemoveProfessionalFromTreatmentUseCase

describe('Remove Professional From Treatment Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new RemoveProfessionalFromTreatmentUseCase(treatmentsRepository)
  })

  it('should be able to remove a professional from a treatment', async () => {
    const treatment = await treatmentsRepository.create({
      name: 'Limpeza',
      description: 'Limpeza dos dentes',
      durationMinutes: 30,
      price: 100,
    })

    await treatmentsRepository.addProfessional(treatment.id, 'professional-1')

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
