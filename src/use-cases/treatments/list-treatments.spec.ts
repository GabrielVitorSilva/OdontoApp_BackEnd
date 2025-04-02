import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { ListTreatmentsUseCase } from './list-treatments'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: ListTreatmentsUseCase

describe('List Treatments Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new ListTreatmentsUseCase(treatmentsRepository)
  })

  it('should be able to list treatments', async () => {
    await treatmentsRepository.create({
      name: 'Limpeza',
      description: 'Limpeza dentária profissional',
      durationMinutes: 45,
      price: 120,
      professional: {
        connect: {
          id: 'professional-1',
        },
      },
    })

    await treatmentsRepository.create({
      name: 'Extração',
      description: 'Extração de dente',
      durationMinutes: 60,
      price: 250,
      professional: {
        connect: {
          id: 'professional-2',
        },
      },
    })

    const { treatments } = await sut.execute()

    expect(treatments).toHaveLength(2)
    expect(treatments).toEqual([
      expect.objectContaining({ name: 'Limpeza' }),
      expect.objectContaining({ name: 'Extração' }),
    ])
  })

  it('should return an empty array when no treatments exist', async () => {
    const { treatments } = await sut.execute()

    expect(treatments).toHaveLength(0)
    expect(treatments).toEqual([])
  })
})
