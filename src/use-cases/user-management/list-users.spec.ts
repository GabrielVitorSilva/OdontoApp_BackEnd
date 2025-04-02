import { expect, describe, it, beforeEach } from 'vitest'
import { ListUsersUseCase } from './list-users'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

let usersRepository: InMemoryUsersRepository
let sut: ListUsersUseCase

describe('List Users Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ListUsersUseCase(usersRepository)
  })

  it('should be able to list all users', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '12345678910',
    })

    await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '98765432109',
    })

    const { users } = await sut.execute()

    expect(users).toHaveLength(2)
    expect(users).toEqual([
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

  it('should return an empty array when no users exist', async () => {
    const { users } = await sut.execute()
    expect(users).toHaveLength(0)
    expect(users).toEqual([])
  })
})
