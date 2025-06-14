import { expect, describe, it, beforeEach } from 'vitest'
import { GetUserUseCase } from './get-user'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

let usersRepository: InMemoryUsersRepository
let sut: GetUserUseCase

describe('Get User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserUseCase(usersRepository)
  })

  it('should be able to get any user as admin', async () => {
    const admin = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    await usersRepository.createAdmin(admin.id)

    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await usersRepository.createClient(client.id)

    const professional = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '45678912301',
    })

    await usersRepository.createProfessional(professional.id)

    const { user: clientUser } = await sut.execute({
      id: client.id,
      authenticatedUserId: admin.id,
    })

    const { user: professionalUser } = await sut.execute({
      id: professional.id,
      authenticatedUserId: admin.id,
    })

    expect(clientUser.User).toEqual(
      expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
        role: 'CLIENT',
      }),
    )

    expect(professionalUser.User).toEqual(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        role: 'PROFESSIONAL',
      }),
    )
  })

  it('should be able to get only clients as professional', async () => {
    const professional = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '45678912301',
    })

    await usersRepository.createProfessional(professional.id)

    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await usersRepository.createClient(client.id)

    const { user: clientUser } = await sut.execute({
      id: client.id,
      authenticatedUserId: professional.id,
    })

    expect(clientUser.User).toEqual(
      expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
        role: 'CLIENT',
      }),
    )

    await expect(() =>
      sut.execute({
        id: professional.id,
        authenticatedUserId: professional.id,
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError)
  })

  it('should be able to get only itself as client', async () => {
    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await usersRepository.createClient(client.id)

    const otherClient = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '45678912301',
    })

    await usersRepository.createClient(otherClient.id)

    const { user: selfUser } = await sut.execute({
      id: client.id,
      authenticatedUserId: client.id,
    })

    expect(selfUser.User).toEqual(
      expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
        role: 'CLIENT',
      }),
    )

    await expect(() =>
      sut.execute({
        id: otherClient.id,
        authenticatedUserId: client.id,
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError)
  })

  it('should not be able to get a non-existent user', async () => {
    const admin = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    await usersRepository.createAdmin(admin.id)

    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        authenticatedUserId: admin.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
