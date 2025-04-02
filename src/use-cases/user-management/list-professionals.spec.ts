import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { expect, describe, it, beforeEach } from 'vitest'
import { ListProfessionalsUseCase } from './list-professionals'

let usersRepository: InMemoryUsersRepository
let sut: ListProfessionalsUseCase

describe('List Professionals Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ListProfessionalsUseCase(usersRepository)
  })

  it('should be able to list professionals', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678900',
      password: '123456',
      role: 'PROFESSIONAL',
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      cpf: '98765432100',
      password: '123456',
      role: 'PROFESSIONAL',
    })

    await usersRepository.create({
      name: 'Admin',
      email: 'admin@example.com',
      cpf: '11122233300',
      password: '123456',
      role: 'ADMIN',
    })

    const professional1 = await usersRepository.createProfessional(user1.id)
    const professional2 = await usersRepository.createProfessional(user2.id)

    const { professionals, total } = await sut.execute({
      page: 1,
      perPage: 10,
    })

    expect(professionals).toHaveLength(2)
    expect(total).toBe(2)
    expect(professionals).toEqual([
      expect.objectContaining({
        id: user1.id,
        name: 'John Doe',
        professionalId: professional1.id,
      }),
      expect.objectContaining({
        id: user2.id,
        name: 'Jane Doe',
        professionalId: professional2.id,
      }),
    ])
  })

  it('should be able to list professionals with pagination', async () => {
    for (let i = 0; i < 15; i++) {
      const user = await usersRepository.create({
        name: `Professional ${i + 1}`,
        email: `professional${i + 1}@example.com`,
        cpf: `${i + 1}2345678900`,
        password: '123456',
        role: 'PROFESSIONAL',
      })

      await usersRepository.createProfessional(user.id)
    }

    const { professionals, total } = await sut.execute({
      page: 1,
      perPage: 10,
    })

    expect(professionals).toHaveLength(10)
    expect(total).toBe(15)
    expect(professionals[0]).toHaveProperty('professionalId')
  })

  it('should return an empty array when there are no professionals', async () => {
    const { professionals, total } = await sut.execute({
      page: 1,
      perPage: 10,
    })

    expect(professionals).toHaveLength(0)
    expect(total).toBe(0)
  })
})
