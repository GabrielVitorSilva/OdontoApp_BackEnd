import { expect, describe, it, beforeEach } from 'vitest'
import { ListUsersUseCase } from './list-users'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

let usersRepository: InMemoryUsersRepository
let sut: ListUsersUseCase

describe('List Users Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ListUsersUseCase(usersRepository)
  })

  it('should be able to list all users as admin', async () => {
    const admin = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '45678912301',
    })

    const { users } = await sut.execute({
      authenticatedUserId: admin.id,
    })

    expect(users).toHaveLength(3)
    expect(users).toEqual([
      expect.objectContaining({
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      }),
      expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
        role: 'CLIENT',
      }),
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        role: 'PROFESSIONAL',
      }),
    ])
  })

  it('should be able to list only clients as professional', async () => {
    const professional = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '45678912301',
    })

    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    const { users } = await sut.execute({
      authenticatedUserId: professional.id,
    })

    expect(users).toHaveLength(1)
    expect(users).toEqual([
      expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
        role: 'CLIENT',
      }),
    ])
  })

  it('should not be able to list users as client', async () => {
    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await expect(() =>
      sut.execute({
        authenticatedUserId: client.id,
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError)
  })

  it('should return an empty array when no users exist', async () => {
    const admin = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    await usersRepository.delete(admin.id)

    const authAdmin = await usersRepository.create({
      name: 'Auth Admin',
      email: 'auth.admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '11122233344',
    })

    const { users } = await sut.execute({
      authenticatedUserId: authAdmin.id,
    })

    expect(users).toHaveLength(1)
    expect(users).toEqual([
      expect.objectContaining({
        name: 'Auth Admin',
        email: 'auth.admin@example.com',
        role: 'ADMIN',
      }),
    ])
  })
})
