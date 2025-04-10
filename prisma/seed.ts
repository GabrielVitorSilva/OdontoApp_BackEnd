/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker'
import { PrismaClient, Role, ConsultationStatus } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  // Limpar dados existentes
  await prisma.consultation.deleteMany()
  await prisma.treatment.deleteMany()
  await prisma.client.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.administrator.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.user.deleteMany()

  const { hash } = bcryptjs
  const passwordHash = await hash('123@Senha', 6)

  // Criar 10 usuários com roles diversas
  const users = []

  // 2 ADMIN
  for (let i = 0; i < 2; i++) {
    const admin = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        role: 'ADMIN',
        cpf: faker.string.numeric(11),
        phone: faker.phone.number(),
      },
    })

    users.push(admin)

    // Criar registro na tabela Administrator
    await prisma.administrator.create({
      data: {
        userId: admin.id,
      },
    })
  }

  // 3 PROFESSIONAL
  const professionals = []
  for (let i = 0; i < 3; i++) {
    const professional = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        role: 'PROFESSIONAL',
        cpf: faker.string.numeric(11),
        phone: faker.phone.number(),
      },
    })

    users.push(professional)

    // Criar registro na tabela Professional
    const professionalRecord = await prisma.professional.create({
      data: {
        userId: professional.id,
      },
    })

    professionals.push(professionalRecord)
  }

  // 5 CLIENT
  const clients = []
  for (let i = 0; i < 5; i++) {
    const client = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        role: 'CLIENT',
        cpf: faker.string.numeric(11),
        phone: faker.phone.number(),
      },
    })

    users.push(client)

    // Criar registro na tabela Client
    const clientRecord = await prisma.client.create({
      data: {
        userId: client.id,
      },
    })

    clients.push(clientRecord)
  }

  // Lista de tratamentos odontológicos comuns
  const treatments = [
    {
      name: 'Limpeza Dental Profissional',
      description:
        'Remoção de tártaro e placa bacteriana. Recomendado a cada 6 meses.',
      durationMinutes: 60,
      price: 150.0,
    },
    {
      name: 'Restauração de Resina',
      description:
        'Restauração de dentes com resina composta para tratamento de cáries.',
      durationMinutes: 60,
      price: 200.0,
    },
    {
      name: 'Tratamento de Canal',
      description: 'Procedimento para tratar infecções na polpa do dente.',
      durationMinutes: 90,
      price: 800.0,
    },
    {
      name: 'Extração Simples',
      description: 'Remoção de dentes danificados ou com problemas.',
      durationMinutes: 45,
      price: 250.0,
    },
    {
      name: 'Implante Dentário',
      description:
        'Colocação de implante de titânio para substituir dentes perdidos.',
      durationMinutes: 120,
      price: 3000.0,
    },
    {
      name: 'Clareamento Dental',
      description: 'Procedimento estético para clarear os dentes.',
      durationMinutes: 90,
      price: 900.0,
    },
    {
      name: 'Instalação de Aparelho Ortodôntico',
      description: 'Colocação de aparelho para correção da posição dos dentes.',
      durationMinutes: 90,
      price: 1500.0,
    },
    {
      name: 'Prótese Dentária',
      description: 'Confecção de próteses para substituir dentes perdidos.',
      durationMinutes: 120,
      price: 1200.0,
    },
    {
      name: 'Tratamento de Gengiva',
      description: 'Tratamento de problemas periodontais e gengivais.',
      durationMinutes: 60,
      price: 400.0,
    },
    {
      name: 'Avaliação e Diagnóstico',
      description:
        'Consulta inicial para avaliação da saúde bucal e planejamento de tratamento.',
      durationMinutes: 45,
      price: 120.0,
    },
  ]

  // Criar tratamentos
  for (const treatment of treatments) {
    await prisma.treatment.create({
      data: {
        name: treatment.name,
        description: treatment.description,
        durationMinutes: treatment.durationMinutes,
        price: treatment.price,
      },
    })
  }

  // Associar tratamentos aleatoriamente aos profissionais
  const allTreatments = await prisma.treatment.findMany()
  for (const professional of professionals) {
    // Cada profissional terá 2-4 tratamentos aleatórios
    const numberOfTreatments = Math.floor(Math.random() * 3) + 2
    const shuffledTreatments = [...allTreatments].sort(
      () => 0.5 - Math.random(),
    )
    const selectedTreatments = shuffledTreatments.slice(0, numberOfTreatments)

    for (const treatment of selectedTreatments) {
      await prisma.treatment.update({
        where: { id: treatment.id },
        data: {
          professionals: {
            connect: { id: professional.id },
          },
        },
      })
    }
  }

  // Criar algumas consultas aleatórias
  const treatmentsWithProfessionals = await prisma.treatment.findMany({
    include: {
      professionals: true,
    },
  })

  for (let i = 0; i < 15; i++) {
    // Escolher um cliente aleatório
    const randomClientIndex = Math.floor(Math.random() * clients.length)
    const client = clients[randomClientIndex]

    // Escolher um tratamento aleatório que tenha profissionais associados
    const availableTreatments = treatmentsWithProfessionals.filter(
      (treatment) => treatment.professionals.length > 0,
    )

    if (availableTreatments.length === 0) {
      console.log('Nenhum tratamento com profissionais associados encontrado')
      continue
    }

    const randomTreatmentIndex = Math.floor(
      Math.random() * availableTreatments.length,
    )
    const treatment = availableTreatments[randomTreatmentIndex]

    // Escolher um profissional aleatório associado ao tratamento
    const randomProfessionalIndex = Math.floor(
      Math.random() * treatment.professionals.length,
    )
    const professional = treatment.professionals[randomProfessionalIndex]

    // Gerar uma data aleatória nos próximos 60 dias
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 60))

    // Ajustar para horário comercial (8h às 18h)
    futureDate.setHours(8 + Math.floor(Math.random() * 9), 0, 0, 0)

    // Status aleatório
    const statusOptions: ConsultationStatus[] = [
      'SCHEDULED',
      'CANCELED',
      'COMPLETED',
    ]
    const randomStatus =
      statusOptions[Math.floor(Math.random() * statusOptions.length)]

    await prisma.consultation.create({
      data: {
        clientId: client.id,
        professionalId: professional.id,
        treatmentId: treatment.id,
        dateTime: futureDate,
        status: randomStatus,
      },
    })
  }

  console.log(`Seed concluído: ${users.length} usuários criados`)
  console.log(`- ${professionals.length} profissionais`)
  console.log(`- ${clients.length} clientes`)
  console.log(`- ${treatments.length} tratamentos`)
  console.log(`- Várias consultas agendadas`)
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
