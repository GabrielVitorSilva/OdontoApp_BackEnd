import { expect, describe, it, beforeEach } from 'vitest'
import { UpdateUserUseCase } from './update-user'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'
import { EmailAlreadyInUseError } from '../@errors/email-already-in-use-error'
import { randomUUID } from 'node:crypto'
import type { User } from '@prisma/client'

let usersRepository: InMemoryUsersRepository
let sut: UpdateUserUseCase
let adminUser: User
let clientUser: User

describe('Update User Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateUserUseCase(usersRepository)

    adminUser = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'ADMIN',
      cpf: '98765432100',
    })

    clientUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '12345678910',
    })
  })

  it('should be able to update a user', async () => {
    const { user } = await sut.execute({
      id: clientUser.id,
      name: 'New Name',
      email: 'newemail@example.com',
      phone: '123456789',
      authenticatedUserId: clientUser.id,
    })

    expect(user.name).toEqual('New Name')
    expect(user.email).toEqual('newemail@example.com')
    expect(user.phone).toEqual('123456789')
  })

  it('should allow admin to update any user', async () => {
    const { user } = await sut.execute({
      id: clientUser.id,
      name: 'New Name',
      authenticatedUserId: adminUser.id,
    })

    expect(user.name).toEqual('New Name')
    expect(user.id).toEqual(clientUser.id)
  })

  it('should allow user to update their own information', async () => {
    const { user } = await sut.execute({
      id: clientUser.id,
      name: 'New Name',
      authenticatedUserId: clientUser.id,
    })

    expect(user.name).toEqual('New Name')
  })

  it('should not allow non-admin users to update other users', async () => {
    const otherUser = await usersRepository.create({
      name: 'Other User',
      email: 'other@example.com',
      password: 'Other123!',
      role: 'CLIENT',
      cpf: '11122233344',
    })

    await expect(() =>
      sut.execute({
        id: clientUser.id,
        name: 'New Name',
        authenticatedUserId: otherUser.id,
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError)
  })

  it('should throw ResourceNotFoundError when user does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        name: 'New Name',
        authenticatedUserId: adminUser.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw EmailAlreadyInUseError when updating to an email already in use', async () => {
    await usersRepository.create({
      name: 'Other User',
      email: 'other@example.com',
      password: 'Other123!',
      role: 'CLIENT',
      cpf: '11122233344',
    })

    await expect(() =>
      sut.execute({
        id: clientUser.id,
        email: 'other@example.com',
        authenticatedUserId: clientUser.id,
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError)
  })

  it('should not throw error when updating the email to the same value', async () => {
    const { user } = await sut.execute({
      id: clientUser.id,
      email: clientUser.email,
      authenticatedUserId: clientUser.id,
    })

    expect(user.email).toEqual(clientUser.email)
  })
})
