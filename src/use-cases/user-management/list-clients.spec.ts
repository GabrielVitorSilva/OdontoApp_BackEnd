import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { ListClientsUseCase } from './list-clients'

let usersRepository: InMemoryUsersRepository
let sut: ListClientsUseCase

describe('List Clients Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ListClientsUseCase(usersRepository)
  })

  it('should be able to list clients', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678900',
      password: '123456',
      role: 'CLIENT',
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      cpf: '98765432100',
      password: '123456',
      role: 'CLIENT',
    })

    await usersRepository.create({
      name: 'Admin',
      email: 'admin@example.com',
      cpf: '11122233300',
      password: '123456',
      role: 'ADMIN',
    })

    const client1 = await usersRepository.createClient(user1.id)
    const client2 = await usersRepository.createClient(user2.id)

    const { clients, total } = await sut.execute({
      page: 1,
      perPage: 10,
    })

    expect(clients).toHaveLength(2)
    expect(total).toBe(2)
    expect(clients).toEqual([
      expect.objectContaining({
        id: user1.id,
        name: 'John Doe',
        clientId: client1.id,
      }),
      expect.objectContaining({
        id: user2.id,
        name: 'Jane Doe',
        clientId: client2.id,
      }),
    ])
  })

  it('should be able to list clients with pagination', async () => {
    for (let i = 0; i < 15; i++) {
      const user = await usersRepository.create({
        name: `Client ${i + 1}`,
        email: `client${i + 1}@example.com`,
        cpf: `${i + 1}2345678900`,
        password: '123456',
        role: 'CLIENT',
      })

      await usersRepository.createClient(user.id)
    }

    const { clients, total } = await sut.execute({
      page: 1,
      perPage: 10,
    })

    expect(clients).toHaveLength(10)
    expect(total).toBe(15)
    expect(clients[0]).toHaveProperty('clientId')
  })

  it('should return an empty array when there are no clients', async () => {
    const { clients, total } = await sut.execute({
      page: 1,
      perPage: 10,
    })

    expect(clients).toHaveLength(0)
    expect(total).toBe(0)
  })
})
