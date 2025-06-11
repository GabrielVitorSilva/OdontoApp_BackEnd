import { expect, describe, it, beforeEach } from 'vitest'
import { ListConsultationsUseCase } from './list-consultations'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryConsultationRepository } from '@/repositories/in-memory/in-memory-consultation-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found'
import { NotAllowed } from '../@errors/not-allowed'

let usersRepository: InMemoryUsersRepository
let consultationRepository: InMemoryConsultationRepository
let sut: ListConsultationsUseCase

describe('List Consultations Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    consultationRepository = new InMemoryConsultationRepository()
    sut = new ListConsultationsUseCase(consultationRepository, usersRepository)
  })

  it('should be able to list all consultations as admin', async () => {
    const admin = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    const consultation1 = await consultationRepository.create({
      dateTime: new Date(),
      status: 'SCHEDULED',
      client: {
        connect: {
          id: 'client-1',
        },
      },
      professional: {
        connect: {
          id: 'professional-1',
        },
      },
      treatment: {
        connect: {
          id: 'treatment-1',
        },
      },
    })

    const consultation2 = await consultationRepository.create({
      dateTime: new Date(),
      status: 'COMPLETED',
      client: {
        connect: {
          id: 'client-2',
        },
      },
      professional: {
        connect: {
          id: 'professional-2',
        },
      },
      treatment: {
        connect: {
          id: 'treatment-2',
        },
      },
    })

    const { consultations } = await sut.execute({
      userId: admin.id,
    })

    expect(consultations).toHaveLength(2)
    expect(consultations).toEqual([
      expect.objectContaining({
        id: consultation1.id,
        status: 'SCHEDULED',
      }),
      expect.objectContaining({
        id: consultation2.id,
        status: 'COMPLETED',
      }),
    ])
  })

  it('should not be able to list consultations as non-admin user', async () => {
    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await expect(() =>
      sut.execute({
        userId: client.id,
      }),
    ).rejects.toBeInstanceOf(NotAllowed)
  })

  it('should not be able to list consultations with non-existent user', async () => {
    await expect(() =>
      sut.execute({
        userId: 'non-existent-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
