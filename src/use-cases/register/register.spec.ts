import { compare } from 'bcryptjs'
import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from '../@errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  it('should to register', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '123.456.789-12',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '123.456.789-12',
    })

    const isPasswordCorrectlyHashed = await compare('123456', user.password)

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const email = 'johndoe@example.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: '123456',
      role: 'ADMIN',
      cpf: '123.456.789-12',
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email,
        password: '123456',
        role: 'ADMIN',
        cpf: '123.456.789-12',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
  it('should not be able to register with CPF email twice', async () => {
    const cpf = '12345678910'

    await sut.execute({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf,
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe1@example.com',
        password: '123456',
        role: 'ADMIN',
        cpf,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
