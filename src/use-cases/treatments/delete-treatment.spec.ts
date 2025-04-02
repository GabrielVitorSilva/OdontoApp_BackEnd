import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { DeleteTreatmentUseCase } from './delete-treatment'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: DeleteTreatmentUseCase

describe('Delete Treatment Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new DeleteTreatmentUseCase(treatmentsRepository)
  })

  it('should be able to delete a treatment', async () => {
    const createdTreatment = await treatmentsRepository.create({
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

    await sut.execute({
      id: createdTreatment.id,
    })

    const treatments = await treatmentsRepository.findMany()
    expect(treatments).toHaveLength(0)
  })

  it('should not be able to delete a non-existing treatment', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
