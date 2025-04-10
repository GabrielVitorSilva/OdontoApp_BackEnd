import { compare } from 'bcryptjs'
import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from '../@errors/user-already-exists-error'
import { NotAllowedToCreate } from '../@errors/not-allowed-to-create'
import type { User } from '@prisma/client'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase
let authenticatedUser: User

describe('Register Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)

    authenticatedUser = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'ADMIN',
      cpf: '98765432100',
    })

    await usersRepository.createAdmin(authenticatedUser.id)
  })

  it('should allow an admin to register a new user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '12345678910',
      authenticatedUserId: authenticatedUser.id,
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should create a client record when registering a CLIENT user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '12345678910',
      authenticatedUserId: authenticatedUser.id,
    })

    const clientRecord = usersRepository.clients.find(
      (client) => client.userId === user.id,
    )

    expect(clientRecord).toBeTruthy()
    expect(clientRecord?.id).toEqual(expect.any(String))
    expect(clientRecord?.userId).toEqual(user.id)
  })

  it('should create a professional record when registering a PROFESSIONAL user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '12345678910',
      authenticatedUserId: authenticatedUser.id,
    })

    const professionalRecord = usersRepository.professionals.find(
      (professional) => professional.userId === user.id,
    )

    expect(professionalRecord).toBeTruthy()
    expect(professionalRecord?.id).toEqual(expect.any(String))
    expect(professionalRecord?.userId).toEqual(user.id)
  })

  it('should create an admin record when registering an ADMIN user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
      authenticatedUserId: authenticatedUser.id,
    })

    const adminRecord = usersRepository.admins.find(
      (admin) => admin.userId === user.id,
    )

    expect(adminRecord).toBeTruthy()
    expect(adminRecord?.id).toEqual(expect.any(String))
    expect(adminRecord?.userId).toEqual(user.id)
  })

  it('should not allow a professional to register an admin', async () => {
    const professionalUser = await usersRepository.create({
      name: 'Professional User',
      email: 'professional@example.com',
      password: 'Prof123!',
      role: 'PROFESSIONAL',
      cpf: '98765432111',
    })

    await usersRepository.createProfessional(professionalUser.id)

    await expect(() =>
      sut.execute({
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'Admin123!',
        role: 'ADMIN',
        cpf: '11122233344',
        authenticatedUserId: professionalUser.id,
      }),
    ).rejects.toBeInstanceOf(NotAllowedToCreate)
  })

  it('should not allow a client to register any user', async () => {
    const clientUser = await usersRepository.create({
      name: 'Client User',
      email: 'client@example.com',
      password: 'Client123!',
      role: 'CLIENT',
      cpf: '98765432122',
    })

    await usersRepository.createClient(clientUser.id)

    await expect(() =>
      sut.execute({
        name: 'Another User',
        email: 'another@example.com',
        password: '123456',
        role: 'CLIENT',
        cpf: '55566677788',
        authenticatedUserId: clientUser.id,
      }),
    ).rejects.toBeInstanceOf(NotAllowedToCreate)
  })

  it('should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456A!',
      role: 'CLIENT',
      cpf: '12345678912',
      authenticatedUserId: authenticatedUser.id,
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
      role: 'ADMIN',
      cpf: '12345678912',
      authenticatedUserId: authenticatedUser.id,
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email,
        password: '123456A!',
        role: 'ADMIN',
        cpf: '98765432101',
        authenticatedUserId: authenticatedUser.id,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should not be able to register with same CPF twice', async () => {
    const cpf = '12345678910'

    await sut.execute({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password: '123456A!',
      role: 'ADMIN',
      cpf,
      authenticatedUserId: authenticatedUser.id,
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe2@example.com',
        password: '123456A!',
        role: 'ADMIN',
        cpf,
        authenticatedUserId: authenticatedUser.id,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
