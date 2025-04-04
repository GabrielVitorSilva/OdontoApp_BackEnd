import { expect, describe, it, beforeEach } from 'vitest'
import { CreateConsultationUseCase } from './create-consultation'
import { InMemoryConsultationRepository } from '@/repositories/in-memory/in-memory-consultation-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '../@errors/invalid-consultation-date-error'
import { ProfessionalNotLinkedToTreatmentError } from '../@errors/professional-not-linked-to-treatment-error'
import { ConsultationTimeConflictError } from '../@errors/consultation-time-conflict-error'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'node:crypto'

let consultationRepository: InMemoryConsultationRepository
let sut: CreateConsultationUseCase

describe('Create Consultation Use Case', () => {
  beforeEach(async () => {
    consultationRepository = new InMemoryConsultationRepository()
    sut = new CreateConsultationUseCase(consultationRepository)

    // Limpar o banco de dados antes de cada teste
    await prisma.consultation.deleteMany()
    await prisma.treatment.deleteMany()
    await prisma.professional.deleteMany()
    await prisma.client.deleteMany()
    await prisma.administrator.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should be able to create a consultation', async () => {
    // Criar um cliente
    const clientUser = await prisma.user.create({
      data: {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        password: '123456',
        cpf: '12345678910',
        role: 'CLIENT',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
      },
    })

    // Criar um profissional
    const professionalUser = await prisma.user.create({
      data: {
        name: 'Profissional Teste',
        email: 'profissional@teste.com',
        password: '123456',
        cpf: '98765432110',
        role: 'PROFESSIONAL',
      },
    })

    const professional = await prisma.professional.create({
      data: {
        userId: professionalUser.id,
      },
    })

    // Criar um tratamento
    const treatment = await prisma.treatment.create({
      data: {
        name: 'Tratamento Teste',
        description: 'Descrição do tratamento teste',
        durationMinutes: 60,
        price: 150,
        professionals: {
          connect: {
            id: professional.id,
          },
        },
      },
    })

    // Data futura para a consulta
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
    // Criar um cliente
    const clientUser = await prisma.user.create({
      data: {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        password: '123456',
        cpf: '12345678910',
        role: 'CLIENT',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
      },
    })

    // Criar um profissional
    const professionalUser = await prisma.user.create({
      data: {
        name: 'Profissional Teste',
        email: 'profissional@teste.com',
        password: '123456',
        cpf: '98765432110',
        role: 'PROFESSIONAL',
      },
    })

    const professional = await prisma.professional.create({
      data: {
        userId: professionalUser.id,
      },
    })

    // Criar um tratamento
    const treatment = await prisma.treatment.create({
      data: {
        name: 'Tratamento Teste',
        description: 'Descrição do tratamento teste',
        durationMinutes: 60,
        price: 150,
        professionals: {
          connect: {
            id: professional.id,
          },
        },
      },
    })

    // Data passada para a consulta
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
    // Criar um profissional
    const professionalUser = await prisma.user.create({
      data: {
        name: 'Profissional Teste',
        email: 'profissional@teste.com',
        password: '123456',
        cpf: '98765432110',
        role: 'PROFESSIONAL',
      },
    })

    const professional = await prisma.professional.create({
      data: {
        userId: professionalUser.id,
      },
    })

    // Criar um tratamento
    const treatment = await prisma.treatment.create({
      data: {
        name: 'Tratamento Teste',
        description: 'Descrição do tratamento teste',
        durationMinutes: 60,
        price: 150,
        professionals: {
          connect: {
            id: professional.id,
          },
        },
      },
    })

    // Data futura para a consulta
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
    // Criar um cliente
    const clientUser = await prisma.user.create({
      data: {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        password: '123456',
        cpf: '12345678910',
        role: 'CLIENT',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
      },
    })

    // Criar um tratamento
    const treatment = await prisma.treatment.create({
      data: {
        name: 'Tratamento Teste',
        description: 'Descrição do tratamento teste',
        durationMinutes: 60,
        price: 150,
      },
    })

    // Data futura para a consulta
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
    // Criar um cliente
    const clientUser = await prisma.user.create({
      data: {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        password: '123456',
        cpf: '12345678910',
        role: 'CLIENT',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
      },
    })

    // Criar um profissional
    const professionalUser = await prisma.user.create({
      data: {
        name: 'Profissional Teste',
        email: 'profissional@teste.com',
        password: '123456',
        cpf: '98765432110',
        role: 'PROFESSIONAL',
      },
    })

    const professional = await prisma.professional.create({
      data: {
        userId: professionalUser.id,
      },
    })

    // Data futura para a consulta
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

  it('should not be able to create a consultation with professional not linked to treatment', async () => {
    // Criar um cliente
    const clientUser = await prisma.user.create({
      data: {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        password: '123456',
        cpf: '12345678910',
        role: 'CLIENT',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
      },
    })

    // Criar um profissional
    const professionalUser = await prisma.user.create({
      data: {
        name: 'Profissional Teste',
        email: 'profissional@teste.com',
        password: '123456',
        cpf: '98765432110',
        role: 'PROFESSIONAL',
      },
    })

    const professional = await prisma.professional.create({
      data: {
        userId: professionalUser.id,
      },
    })

    // Criar um tratamento sem vincular ao profissional
    const treatment = await prisma.treatment.create({
      data: {
        name: 'Tratamento Teste',
        description: 'Descrição do tratamento teste',
        durationMinutes: 60,
        price: 150,
      },
    })

    // Data futura para a consulta
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    await expect(() =>
      sut.execute({
        id: randomUUID(),
        clientId: client.id,
        professionalId: professional.id,
        treatmentId: treatment.id,
        dateTime: futureDate,
        status: 'SCHEDULED',
      }),
    ).rejects.toBeInstanceOf(ProfessionalNotLinkedToTreatmentError)
  })

  it('should not be able to create a consultation with time conflict', async () => {
    // Criar um cliente
    const clientUser = await prisma.user.create({
      data: {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        password: '123456',
        cpf: '12345678910',
        role: 'CLIENT',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
      },
    })

    // Criar um profissional
    const professionalUser = await prisma.user.create({
      data: {
        name: 'Profissional Teste',
        email: 'profissional@teste.com',
        password: '123456',
        cpf: '98765432110',
        role: 'PROFESSIONAL',
      },
    })

    const professional = await prisma.professional.create({
      data: {
        userId: professionalUser.id,
      },
    })

    // Criar um tratamento
    const treatment = await prisma.treatment.create({
      data: {
        name: 'Tratamento Teste',
        description: 'Descrição do tratamento teste',
        durationMinutes: 60,
        price: 150,
        professionals: {
          connect: {
            id: professional.id,
          },
        },
      },
    })

    // Data futura para a consulta
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1) // Amanhã
    futureDate.setHours(10, 0, 0, 0) // 10:00

    // Criar uma consulta existente
    await consultationRepository.create({
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

    // Tentar criar outra consulta no mesmo horário
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
