import { expect, describe, it, beforeEach } from 'vitest'
import { DeleteConsultationUseCase } from './delete-consultation'
import { InMemoryConsultationRepository } from '@/repositories/in-memory/in-memory-consultation-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { randomUUID } from 'node:crypto'

let consultationRepository: InMemoryConsultationRepository
let usersRepository: InMemoryUsersRepository
let treatmentsRepository: InMemoryTreatmentsRepository
let sut: DeleteConsultationUseCase

describe('Delete Consultation Use Case', () => {
  beforeEach(() => {
    consultationRepository = new InMemoryConsultationRepository()
    usersRepository = new InMemoryUsersRepository()
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new DeleteConsultationUseCase(consultationRepository, usersRepository)
  })

  it('should be able to delete a consultation', async () => {
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

    await sut.execute({ id: consultation.id })

    const deletedConsultation = await consultationRepository.findById(
      consultation.id,
    )

    expect(deletedConsultation).toBeNull()
  })

  it('should not be able to delete a non-existent consultation', async () => {
    await expect(() =>
      sut.execute({ id: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
}) 