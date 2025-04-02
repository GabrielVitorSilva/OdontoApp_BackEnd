import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { GetTreatmentUseCase } from './get-treatment'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: GetTreatmentUseCase

describe('Get Treatment Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new GetTreatmentUseCase(treatmentsRepository)
  })

  it('should be able to get a treatment by id', async () => {
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

    const { treatment } = await sut.execute({
      id: createdTreatment.id,
    })

    expect(treatment.id).toEqual(createdTreatment.id)
    expect(treatment.name).toEqual('Limpeza')
    expect(treatment.description).toEqual('Limpeza dentária profissional')
  })

  it('should not be able to get a treatment with wrong id', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
