import { expect, describe, it, beforeEach } from 'vitest'
import { ListConsultationByClientUseCase } from './list-consultation-by-client'
import { InMemoryConsultationRepository } from '@/repositories/in-memory/in-memory-consultation-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { randomUUID } from 'node:crypto'

let consultationRepository: InMemoryConsultationRepository
let usersRepository: InMemoryUsersRepository
let treatmentsRepository: InMemoryTreatmentsRepository
let sut: ListConsultationByClientUseCase

describe('List Consultation By Client Use Case', () => {
  beforeEach(() => {
    consultationRepository = new InMemoryConsultationRepository()
    usersRepository = new InMemoryUsersRepository()
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new ListConsultationByClientUseCase(consultationRepository)
  })

  it('should be able to list consultations by client', async () => {
    const clientUser = await usersRepository.create({
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
      password: '123456',
      cpf: '12345678910',
      role: 'CLIENT',
    })

    const client = await usersRepository.createClient(clientUser.id)

    const professionalUser = await usersRepository.create({
      name: 'Profissional Teste',
      email: 'profissional@teste.com',
      password: '123456',
      cpf: '98765432110',
      role: 'PROFESSIONAL',
    })

    const professional = await usersRepository.createProfessional(
      professionalUser.id,
    )

    const treatment = await treatmentsRepository.create({
      name: 'Tratamento Teste',
      description: 'Descrição do tratamento teste',
      durationMinutes: 60,
      price: 150,
      professionals: {
        connect: {
          id: professional.id,
        },
      },
    })

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(10, 0, 0, 0)

    const consultation = await consultationRepository.create({
      id: randomUUID(),
      client: {
        connect: {
          id: client.id,
        },
      },
      professional: {
        connect: {
          id: professional.id,
        },
      },
      treatment: {
        connect: {
          id: treatment.id,
        },
      },
      dateTime: futureDate,
      status: 'SCHEDULED',
    })

    const { consultations } = await sut.execute({
      clientId: client.id,
    })

    expect(consultations).toHaveLength(1)
    expect(consultations[0].id).toEqual(consultation.id)
    expect(consultations[0].clientId).toEqual(client.id)
  })

  it('should be able to list empty array when client has no consultations', async () => {
    const clientUser = await usersRepository.create({
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
      password: '123456',
      cpf: '12345678910',
      role: 'CLIENT',
    })

    const client = await usersRepository.createClient(clientUser.id)

    const { consultations } = await sut.execute({
      clientId: client.id,
    })

    expect(consultations).toHaveLength(0)
  })
})
