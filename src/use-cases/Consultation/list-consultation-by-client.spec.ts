import { expect, describe, it, beforeEach } from 'vitest'
import { ListConsultationByClientUseCase } from './list-consultation-by-client'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryConsultationRepository } from '@/repositories/in-memory/in-memory-consultation-repository'

let usersRepository: InMemoryUsersRepository
let consultationRepository: InMemoryConsultationRepository
let sut: ListConsultationByClientUseCase

describe('List Consultation By Client Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    consultationRepository = new InMemoryConsultationRepository(usersRepository)
    sut = new ListConsultationByClientUseCase(consultationRepository)
  })

  it('should be able to list consultations by client', async () => {
    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '12345678910',
    })

    const professional = await usersRepository.create({
      name: 'Professional One',
      email: 'professional1@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '22222222222',
    })

    const clientRecord = await usersRepository.createClient(client.id)
    const professionalRecord = await usersRepository.createProfessional(
      professional.id,
    )

    const consultation1 = await consultationRepository.create({
      dateTime: new Date(),
      status: 'SCHEDULED',
      client: {
        connect: {
          id: clientRecord.id,
        },
      },
      professional: {
        connect: {
          id: professionalRecord.id,
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
          id: clientRecord.id,
        },
      },
      professional: {
        connect: {
          id: professionalRecord.id,
        },
      },
      treatment: {
        connect: {
          id: 'treatment-2',
        },
      },
    })

    const { consultations } = await sut.execute({
      clientId: clientRecord.id,
    })

    expect(consultations).toHaveLength(2)
    expect(consultations).toEqual([
      expect.objectContaining({
        id: consultation1.id,
        clientName: 'John Doe',
        professionalName: 'Professional One',
        treatmentName: 'Treatment 1',
        status: 'SCHEDULED',
      }),
      expect.objectContaining({
        id: consultation2.id,
        clientName: 'John Doe',
        professionalName: 'Professional One',
        treatmentName: 'Treatment 2',
        status: 'COMPLETED',
      }),
    ])
  })
})
