import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { CreateTreatmentUseCase } from './create-treatment'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: CreateTreatmentUseCase

describe('Create Treatment Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new CreateTreatmentUseCase(treatmentsRepository)
  })

  it('should be able to create a treatment', async () => {
    const { treatment } = await sut.execute({
      name: 'Limpeza',
      description: 'Limpeza dentária profissional',
      durationMinutes: 45,
      price: 120,
      professionalId: 'professional-1',
    })

    expect(treatment.id).toEqual(expect.any(String))
    expect(treatment.name).toEqual('Limpeza')
    expect(treatment.description).toEqual('Limpeza dentária profissional')
    expect(treatment.durationMinutes).toEqual(45)
    expect(treatment.price).toEqual(120)
    expect(treatment.professionalId).toEqual('professional-1')
  })

  it('should be able to create a treatment without description', async () => {
    const { treatment } = await sut.execute({
      name: 'Limpeza',
      durationMinutes: 45,
      price: 120,
      professionalId: 'professional-1',
    })

    expect(treatment.id).toEqual(expect.any(String))
    expect(treatment.name).toEqual('Limpeza')
    expect(treatment.description).toBeNull()
  })
})
