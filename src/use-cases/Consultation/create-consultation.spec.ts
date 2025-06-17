import { expect, describe, it, beforeEach } from 'vitest'
import { CreateConsultationUseCase } from './create-consultation'
import { InMemoryConsultationRepository } from '@/repositories/in-memory/in-memory-consultation-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '../@errors/invalid-consultation-date-error'
import { ConsultationTimeConflictError } from '../@errors/consultation-time-conflict-error'
import { randomUUID } from 'node:crypto'

let consultationRepository: InMemoryConsultationRepository
let usersRepository: InMemoryUsersRepository
let treatmentsRepository: InMemoryTreatmentsRepository
let sut: CreateConsultationUseCase

describe('Create Consultation Use Case', () => {
  beforeEach(() => {
    consultationRepository = new InMemoryConsultationRepository()
    usersRepository = new InMemoryUsersRepository()
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new CreateConsultationUseCase(
      consultationRepository,
      treatmentsRepository,
      usersRepository,
    )
  })

  it('should be able to create a consultation', async () => {
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
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    const { consultation } = await sut.execute({
      id: randomUUID(),
      clientId: client.id,
      professionalId: professional.id,
      treatmentId: treatment.id,
      dateTime: futureDate,
      status: 'SCHEDULED',
    })

    expect(consultation.id).toEqual(expect.any(String))
    expect(consultation.clientId).toBe(client.id)
    expect(consultation.professionalId).toBe(professional.id)
    expect(consultation.treatmentId).toBe(treatment.id)
    expect(consultation.dateTime).toEqual(futureDate)
    expect(consultation.status).toBe('SCHEDULED')
  })

  it('should not be able to create a consultation with past date', async () => {
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

    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1) // Ontem
    pastDate.setHours(10, 0, 0, 0) // 10:00

    await expect(() =>
      sut.execute({
        id: randomUUID(),
        clientId: client.id,
        professionalId: professional.id,
        treatmentId: treatment.id,
        dateTime: pastDate,
        status: 'SCHEDULED',
      }),
    ).rejects.toBeInstanceOf(InvalidConsultationDateError)
  })

  it('should not be able to create a consultation with non-existent client', async () => {
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
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    await expect(() =>
      sut.execute({
        id: randomUUID(),
        clientId: 'non-existent-client-id',
        professionalId: professional.id,
        treatmentId: treatment.id,
        dateTime: futureDate,
        status: 'SCHEDULED',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a consultation with non-existent professional', async () => {
    const clientUser = await usersRepository.create({
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
      password: '123456',
      cpf: '12345678910',
      role: 'CLIENT',
    })

    const client = await usersRepository.createClient(clientUser.id)

    const treatment = await treatmentsRepository.create({
      name: 'Tratamento Teste',
      description: 'Descrição do tratamento teste',
      durationMinutes: 60,
      price: 150,
    })

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    await expect(() =>
      sut.execute({
        id: randomUUID(),
        clientId: client.id,
        professionalId: 'non-existent-professional-id',
        treatmentId: treatment.id,
        dateTime: futureDate,
        status: 'SCHEDULED',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a consultation with non-existent treatment', async () => {
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

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    await expect(() =>
      sut.execute({
        id: randomUUID(),
        clientId: client.id,
        professionalId: professional.id,
        treatmentId: 'non-existent-treatment-id',
        dateTime: futureDate,
        status: 'SCHEDULED',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should automatically link professional to treatment if not linked', async () => {
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

    const anotherProfessionalUser = await usersRepository.create({
      name: 'Outro Profissional',
      email: 'outro@teste.com',
      password: '123456',
      cpf: '12345678911',
      role: 'PROFESSIONAL',
    })

    const anotherProfessional = await usersRepository.createProfessional(
      anotherProfessionalUser.id,
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
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    const { consultation } = await sut.execute({
      id: randomUUID(),
      clientId: client.id,
      professionalId: anotherProfessional.id,
      treatmentId: treatment.id,
      dateTime: futureDate,
      status: 'SCHEDULED',
    })

    const treatmentsByProfessional =
      await treatmentsRepository.findByProfessionalId(anotherProfessional.id)

    expect(consultation.id).toEqual(expect.any(String))
    expect(consultation.clientId).toBe(client.id)
    expect(consultation.professionalId).toBe(anotherProfessional.id)
    expect(consultation.treatmentId).toBe(treatment.id)
    expect(consultation.dateTime).toEqual(futureDate)
    expect(consultation.status).toBe('SCHEDULED')
    expect(treatmentsByProfessional).toHaveLength(1)
    expect(treatmentsByProfessional[0].id).toBe(treatment.id)
  })

  it('should not be able to create a consultation with time conflict', async () => {
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
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    await sut.execute({
      id: randomUUID(),
      clientId: client.id,
      professionalId: professional.id,
      treatmentId: treatment.id,
      dateTime: futureDate,
      status: 'SCHEDULED',
    })

    await expect(() =>
      sut.execute({
        id: randomUUID(),
        clientId: client.id,
        professionalId: professional.id,
        treatmentId: treatment.id,
        dateTime: futureDate,
        status: 'SCHEDULED',
      }),
    ).rejects.toBeInstanceOf(ConsultationTimeConflictError)
  })
})
