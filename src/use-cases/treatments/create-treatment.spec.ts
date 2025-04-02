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
      description: 'Limpeza dos dentes',
      durationMinutes: 30,
      price: 100,
    })

    expect(treatment.id).toEqual(expect.any(String))
    expect(treatment.name).toBe('Limpeza')
    expect(treatment.description).toBe('Limpeza dos dentes')
    expect(treatment.durationMinutes).toBe(30)
    expect(treatment.price).toBe(100)
  })

  it('should be able to create a treatment with professionals', async () => {
    const { treatment } = await sut.execute({
      name: 'Limpeza',
      description: 'Limpeza dos dentes',
      durationMinutes: 30,
      price: 100,
      professionalIds: ['professional-1', 'professional-2'],
    })

    expect(treatment.id).toEqual(expect.any(String))
    expect(treatment.name).toBe('Limpeza')
    expect(treatment.description).toBe('Limpeza dos dentes')
    expect(treatment.durationMinutes).toBe(30)
    expect(treatment.price).toBe(100)
  })
})
