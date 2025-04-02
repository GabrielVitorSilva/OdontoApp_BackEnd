import { compare } from 'bcryptjs'
import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterClientUseCase } from './register-client'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from '../@errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let sut: RegisterClientUseCase

describe('Register Client Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterClientUseCase(usersRepository)
  })

  it('should be able to register a new client', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      cpf: '12345678910',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should create a client record in the specific table', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      cpf: '12345678910',
    })

    const clientRecord = usersRepository.clients.find(
      (client) => client.userId === user.id,
    )

    expect(clientRecord).toBeTruthy()
    expect(clientRecord?.id).toEqual(expect.any(String))
    expect(clientRecord?.userId).toEqual(user.id)
  })

  it('should hash client password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456A!',
      cpf: '12345678912',
    })

    const isPasswordCorrectlyHashed = await compare('123456A!', user.password)

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const email = 'johndoe@example.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: '123456A!',
      cpf: '12345678912',
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email,
        password: '123456A!',
        cpf: '87654321098',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should not be able to register with same CPF twice', async () => {
    const cpf = '12345678910'

    await sut.execute({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password: '123456A!',
      cpf,
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe2@example.com',
        password: '123456A!',
        cpf,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should create a user with CLIENT role', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      cpf: '12345678910',
    })

    expect(user.role).toEqual('CLIENT')
  })
})
