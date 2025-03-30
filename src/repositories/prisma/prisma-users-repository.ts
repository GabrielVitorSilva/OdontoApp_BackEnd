import { prisma } from '@/lib/prisma'
import { UsersRepository } from '../users-repository'
import { Prisma, User } from '@prisma/client'

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    return user
  }

  async findByCpf(cpf: string) {
    const user = await prisma.user.findUnique({
      where: {
        cpf,
      },
    })
    return user
  }

  async findByID(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  async updatePersonalId(userId: string, personalId: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { personalId },
    })
    return user
  }

  async findStudentsByPersonalId(personalId: string): Promise<User[]> {
    const students = await prisma.user.findMany({
      where: { personalId },
    })
    return students
  }

  async findUniqueStudentOfPersonal(
    personalId: string,
    studentId: string,
  ): Promise<User | null> {
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        personalId,
      },
    })

    return student
  }

  async removePersonalFromStudent(studentId: string): Promise<User> {
    const student = await prisma.user.update({
      where: { id: studentId },
      data: { personalId: null },
    })
    return student
  }
}
