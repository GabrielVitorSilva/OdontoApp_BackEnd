import { expect, describe, it, beforeEach } from 'vitest'
import { UpdateConsultationUseCase } from './update-consultation'
import { InMemoryConsultationRepository } from '@/repositories/in-memory/in-memory-consultation-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryTreatmentsRepository } from '@/repositories/in-memory/in-memory-treatments-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '../@errors/invalid-consultation-date-error'
import { ProfessionalNotLinkedToTreatmentError } from '../@errors/professional-not-linked-to-treatment-error'
import { ConsultationTimeConflictError } from '../@errors/consultation-time-conflict-error'
import { InvalidConsultationStatusError } from '../@errors/invalid-consultation-status-error'
import { randomUUID } from 'node:crypto'

let consultationRepository: InMemoryConsultationRepository
let usersRepository: InMemoryUsersRepository
let treatmentsRepository: InMemoryTreatmentsRepository
let sut: UpdateConsultationUseCase

describe('Update Consultation Use Case', () => {
  beforeEach(async () => {
    consultationRepository = new InMemoryConsultationRepository()
    usersRepository = new InMemoryUsersRepository()
    treatmentsRepository = new InMemoryTreatmentsRepository()
    sut = new UpdateConsultationUseCase(
      consultationRepository,
      treatmentsRepository,
      usersRepository,
    )
  })

  it('should be able to update a consultation', async () => {
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

    const newFutureDate = new Date()
    newFutureDate.setDate(newFutureDate.getDate() + 2)
    newFutureDate.setHours(11, 0, 0, 0)

    const { consultation: updatedConsultation } = await sut.execute({
      id: consultation.id,
      dateTime: newFutureDate,
      status: 'COMPLETED',
    })

    expect(updatedConsultation.id).toBe(consultation.id)
    expect(updatedConsultation.dateTime).toEqual(newFutureDate)
    expect(updatedConsultation.status).toBe('COMPLETED')
  })

  it('should be able to cancel a SCHEDULED consultation', async () => {
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

    const { consultation: updatedConsultation } = await sut.execute({
      id: consultation.id,
      status: 'CANCELED',
    })

    expect(updatedConsultation.id).toBe(consultation.id)
    expect(updatedConsultation.status).toBe('CANCELED')
  })

  it('should not be able to cancel a COMPLETED consultation', async () => {
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
      status: 'COMPLETED',
    })

    await expect(() =>
      sut.execute({
        id: consultation.id,
        status: 'CANCELED',
      }),
    ).rejects.toBeInstanceOf(InvalidConsultationStatusError)
  })

  it('should not be able to update a consultation with past date', async () => {
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

    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)

    await expect(() =>
      sut.execute({
        id: consultation.id,
        dateTime: pastDate,
      }),
    ).rejects.toBeInstanceOf(InvalidConsultationDateError)
  })

  it('should not be able to update a consultation with conflicting time', async () => {
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

    const anotherClientUser = await usersRepository.create({
      name: 'Outro Cliente Teste',
      email: 'outrocliente@teste.com',
      password: '123456',
      cpf: '12345678911',
      role: 'CLIENT',
    })

    const anotherClient = await usersRepository.createClient(
      anotherClientUser.id,
    )

    await consultationRepository.create({
      id: randomUUID(),
      client: {
        connect: {
          id: anotherClient.id,
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

    await expect(() =>
      sut.execute({
        id: consultation.id,
        dateTime: futureDate,
      }),
    ).rejects.toBeInstanceOf(ConsultationTimeConflictError)
  })

  it('should not be able to update a non-existent consultation', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        status: 'COMPLETED',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a consultation with non-existent client', async () => {
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

    await expect(() =>
      sut.execute({
        id: consultation.id,
        clientId: 'non-existent-client-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a consultation with non-existent professional', async () => {
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

    await expect(() =>
      sut.execute({
        id: consultation.id,
        professionalId: 'non-existent-professional-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a consultation with non-existent treatment', async () => {
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

    await expect(() =>
      sut.execute({
        id: consultation.id,
        treatmentId: 'non-existent-treatment-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a consultation with treatment not linked to professional', async () => {
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
      name: 'Outro Profissional Teste',
      email: 'outroprofissional@teste.com',
      password: '123456',
      cpf: '98765432111',
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

    const anotherTreatment = await treatmentsRepository.create({
      name: 'Outro Tratamento Teste',
      description: 'Descrição do outro tratamento teste',
      durationMinutes: 60,
      price: 150,
      professionals: {
        connect: {
          id: anotherProfessional.id,
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

    await expect(() =>
      sut.execute({
        id: consultation.id,
        treatmentId: anotherTreatment.id,
      }),
    ).rejects.toBeInstanceOf(ProfessionalNotLinkedToTreatmentError)
  })

  it('should not be able to update status of a consultation with past date', async () => {
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
    pastDate.setDate(pastDate.getDate() - 1)
    pastDate.setHours(10, 0, 0, 0)

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
      dateTime: pastDate,
      status: 'SCHEDULED',
    })

    await expect(() =>
      sut.execute({
        id: consultation.id,
        status: 'COMPLETED',
      }),
    ).rejects.toBeInstanceOf(InvalidConsultationDateError)
  })

  it('should be able to cancel a consultation with past date', async () => {
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
    pastDate.setDate(pastDate.getDate() - 1)
    pastDate.setHours(10, 0, 0, 0)

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
      dateTime: pastDate,
      status: 'SCHEDULED',
    })

    const { consultation: updatedConsultation } = await sut.execute({
      id: consultation.id,
      status: 'CANCELED',
    })

    expect(updatedConsultation.id).toBe(consultation.id)
    expect(updatedConsultation.status).toBe('CANCELED')
  })

  it('should be able to update a consultation keeping the same date and time', async () => {
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

    const result = await sut.execute({
      id: consultation.id,
      dateTime: futureDate,
    })

    expect(result.consultation.id).toBe(consultation.id)
    expect(result.consultation.dateTime.getTime()).toBe(futureDate.getTime())
  })
})
