import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { UpdateTreatmentUseCase } from './update-treatment'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'

let treatmentsRepository: InMemoryTreatmentsRepository
let sut: UpdateTreatmentUseCase

describe('Update Treatment Use Case', () => {
  beforeEach(() => {
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new UpdateTreatmentUseCase(treatmentsRepository)
  })

  it('should be able to update a treatment', async () => {
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
      name: 'Limpeza Avançada',
      description: 'Limpeza dentária profissional avançada',
      durationMinutes: 60,
      price: 150,
    })

    expect(treatment.id).toEqual(createdTreatment.id)
    expect(treatment.name).toEqual('Limpeza Avançada')
    expect(treatment.description).toEqual(
      'Limpeza dentária profissional avançada',
    )
    expect(treatment.durationMinutes).toEqual(60)
    expect(treatment.price).toEqual(150)
  })

  it('should be able to update only some fields of a treatment', async () => {
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
      name: 'Limpeza Avançada',
    })

    expect(treatment.id).toEqual(createdTreatment.id)
    expect(treatment.name).toEqual('Limpeza Avançada')
    expect(treatment.description).toEqual('Limpeza dentária profissional')
    expect(treatment.durationMinutes).toEqual(45)
    expect(treatment.price).toEqual(120)
  })

  it('should not be able to update a non-existing treatment', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existing-id',
        name: 'Limpeza Avançada',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
