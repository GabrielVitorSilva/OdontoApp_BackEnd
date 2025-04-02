import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { ListTreatmentsByProfessionalUseCase } from './list-treatments-by-professional'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: ListTreatmentsByProfessionalUseCase

describe('List Treatments By Professional Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new ListTreatmentsByProfessionalUseCase(treatmentsRepository)
  })

  it('should be able to list treatments by professional id', async () => {
    const treatment1 = await treatmentsRepository.create({
      name: 'Limpeza',
      description: 'Limpeza dentária profissional',
      durationMinutes: 45,
      price: 120,
    })

    const treatment2 = await treatmentsRepository.create({
      name: 'Clareamento',
      description: 'Clareamento dental',
      durationMinutes: 60,
      price: 300,
    })

    const treatment3 = await treatmentsRepository.create({
      name: 'Extração',
      description: 'Extração de dente',
      durationMinutes: 60,
      price: 250,
    })

    await treatmentsRepository.addProfessional(treatment1.id, 'professional-1')
    await treatmentsRepository.addProfessional(treatment2.id, 'professional-1')
    await treatmentsRepository.addProfessional(treatment3.id, 'professional-2')

    const { treatments } = await sut.execute({
      professionalId: 'professional-1',
    })

    expect(treatments).toHaveLength(2)
    expect(treatments).toEqual([
      expect.objectContaining({ name: 'Limpeza' }),
      expect.objectContaining({ name: 'Clareamento' }),
    ])
  })

  it('should return an empty array when professional has no treatments', async () => {
    const { treatments } = await sut.execute({
      professionalId: 'professional-1',
    })

    expect(treatments).toHaveLength(0)
    expect(treatments).toEqual([])
  })
})
