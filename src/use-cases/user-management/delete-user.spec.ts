import { expect, describe, it, beforeEach } from 'vitest'
import { DeleteUserUseCase } from './delete-user'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'
import { randomUUID } from 'node:crypto'
import type { User } from '@prisma/client'

let usersRepository: InMemoryUsersRepository
let sut: DeleteUserUseCase
let adminUser: User
let clientUser: User

describe('Delete User Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteUserUseCase(usersRepository)

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

    // Criar registro correspondente na tabela específica
    await usersRepository.createClient(clientUser.id)
  })

  it('should be able to delete a user', async () => {
    await sut.execute({
      id: clientUser.id,
      authenticatedUserId: clientUser.id,
    })

    const deletedUser = await usersRepository.findById(clientUser.id)
    expect(deletedUser).toBeNull()
  })

  it('should remove the client record when deleting a CLIENT user', async () => {
    await sut.execute({
      id: clientUser.id,
      authenticatedUserId: clientUser.id,
    })

    const clientRecord = usersRepository.clients.find(
      (client) => client.userId === clientUser.id,
    )

    expect(clientRecord).toBeUndefined()
  })

  it('should allow admin to delete any user', async () => {
    await sut.execute({
      id: clientUser.id,
      authenticatedUserId: adminUser.id,
    })

    const deletedUser = await usersRepository.findById(clientUser.id)
    expect(deletedUser).toBeNull()
  })

  it('should allow user to delete their own account', async () => {
    await sut.execute({
      id: clientUser.id,
      authenticatedUserId: clientUser.id,
    })

    const deletedUser = await usersRepository.findById(clientUser.id)
    expect(deletedUser).toBeNull()
  })

  it('should not allow non-admin users to delete other users', async () => {
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
        authenticatedUserId: otherUser.id,
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError)
  })

  it('should throw ResourceNotFoundError when user does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        authenticatedUserId: adminUser.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should clean up professional record when deleting a PROFESSIONAL user', async () => {
    const professionalUser = await usersRepository.create({
      name: 'Professional User',
      email: 'professional@example.com',
      password: 'Prof123!',
      role: 'PROFESSIONAL',
      cpf: '98765432111',
    })

    await usersRepository.createProfessional(professionalUser.id)

    await sut.execute({
      id: professionalUser.id,
      authenticatedUserId: adminUser.id,
    })

    const professionalRecord = usersRepository.professionals.find(
      (professional) => professional.userId === professionalUser.id,
    )

    expect(professionalRecord).toBeUndefined()
  })

  it('should clean up admin record when deleting an ADMIN user', async () => {
    // Criamos um admin adicional para teste
    const newAdminUser = await usersRepository.create({
      name: 'New Admin',
      email: 'newadmin@example.com',
      password: 'Admin123!',
      role: 'ADMIN',
      cpf: '11122233355',
    })

    await usersRepository.createAdmin(newAdminUser.id)

    await sut.execute({
      id: newAdminUser.id,
      authenticatedUserId: adminUser.id,
    })

    const adminRecord = usersRepository.admins.find(
      (admin) => admin.userId === newAdminUser.id,
    )

    expect(adminRecord).toBeUndefined()
  })

  it('should be able to delete any user as admin', async () => {
    const admin = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    await sut.execute({
      id: client.id,
      authenticatedUserId: admin.id,
    })

    const deletedUser = await usersRepository.findById(client.id)
    expect(deletedUser).toBeNull()
  })

  it('should be able to delete only clients and itself as professional', async () => {
    const professional = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '45678912301',
    })

    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    // Deletar cliente
    await sut.execute({
      id: client.id,
      authenticatedUserId: professional.id,
    })

    const deletedClient = await usersRepository.findById(client.id)
    expect(deletedClient).toBeNull()

    // Deletar a si mesmo
    await sut.execute({
      id: professional.id,
      authenticatedUserId: professional.id,
    })

    const deletedProfessional = await usersRepository.findById(professional.id)
    expect(deletedProfessional).toBeNull()

    // Tentar deletar outro profissional
    const otherProfessional = await usersRepository.create({
      name: 'Other Professional',
      email: 'other.professional@example.com',
      password: '123456',
      role: 'PROFESSIONAL',
      cpf: '78945612301',
    })

    await expect(() =>
      sut.execute({
        id: otherProfessional.id,
        authenticatedUserId: professional.id,
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError)
  })

  it('should be able to delete only itself as client', async () => {
    const client = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '98765432109',
    })

    const otherClient = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: '123456',
      role: 'CLIENT',
      cpf: '45678912301',
    })

    // Deletar a si mesmo
    await sut.execute({
      id: client.id,
      authenticatedUserId: client.id,
    })

    const deletedSelf = await usersRepository.findById(client.id)
    expect(deletedSelf).toBeNull()

    // Tentar deletar outro cliente
    await expect(() =>
      sut.execute({
        id: otherClient.id,
        authenticatedUserId: client.id,
      }),
    ).rejects.toBeInstanceOf(NotAuthorizedError)
  })

  it('should not be able to delete a non-existent user', async () => {
    const admin = await usersRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'ADMIN',
      cpf: '12345678910',
    })

    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        authenticatedUserId: admin.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
