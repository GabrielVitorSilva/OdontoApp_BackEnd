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
    consultationRepository = new InMemoryConsultationRepository(usersRepository)
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

    const client1 = await usersRepository.create({
      name: 'Client One',
      email: 'client1@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '11111111111',
    })

    const professional1 = await usersRepository.create({
      name: 'Professional One',
      email: 'professional1@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '22222222222',
    })

    const client2 = await usersRepository.create({
      name: 'Client Two',
      email: 'client2@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '33333333333',
    })

    const professional2 = await usersRepository.create({
      name: 'Professional Two',
      email: 'professional2@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '44444444444',
    })

    const client1Record = await usersRepository.createClient(client1.id)
    const professional1Record = await usersRepository.createProfessional(
      professional1.id,
    )
    const client2Record = await usersRepository.createClient(client2.id)
    const professional2Record = await usersRepository.createProfessional(
      professional2.id,
    )

    const consultation1 = await consultationRepository.create({
      dateTime: new Date(),
      status: 'SCHEDULED',
      client: {
        connect: {
          id: client1Record.id,
        },
      },
      professional: {
        connect: {
          id: professional1Record.id,
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
          id: client2Record.id,
        },
      },
      professional: {
        connect: {
          id: professional2Record.id,
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
        clientName: 'Client One',
        professionalName: 'Professional One',
        treatmentName: 'Treatment 1',
        status: 'SCHEDULED',
      }),
      expect.objectContaining({
        id: consultation2.id,
        clientName: 'Client Two',
        professionalName: 'Professional Two',
        treatmentName: 'Treatment 2',
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
