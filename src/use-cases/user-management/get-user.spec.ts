import { expect, describe, it, beforeEach } from 'vitest'
import { GetUserUseCase } from './get-user'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { randomUUID } from 'node:crypto'

let usersRepository: InMemoryUsersRepository
let sut: GetUserUseCase

describe('Get User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserUseCase(usersRepository)
  })

  it('should be able to get a user by id', async () => {
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '12345678910',
    })

    const { user } = await sut.execute({
      id: createdUser.id,
    })

    expect(user.id).toEqual(createdUser.id)
    expect(user.name).toEqual('John Doe')
    expect(user.email).toEqual('johndoe@example.com')
    expect(user.role).toEqual('CLIENT')
  })

  it('should throw ResourceNotFoundError when user does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
