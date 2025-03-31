/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.user.deleteMany()

  const { hash } = bcryptjs
  const passwordHash = await hash('123456', 1)

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: passwordHash,
      role: 'ADMIN',
      cpf: '123.456.789-01',
    },
  })

  const anotherUser = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: passwordHash,
      role: 'CLIENT',
      cpf: '123.456.789-02',
    },
  })

  const anotherUser2 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: passwordHash,
      role: 'PROFESSIONAL',
      cpf: '123.456.789-03',
    },
  })
}

seed().then(() => {
  console.log('Database seeded!')
})
