# Documentação do OdontoApp Backend

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Padrões de Projeto](#padrões-de-projeto)
4. [Tecnologias](#tecnologias)
5. [Configuração do Ambiente](#configuração-do-ambiente)
6. [Estrutura do Projeto](#estrutura-do-projeto)
7. [Funcionalidades](#funcionalidades)
8. [Testes](#testes)
9. [Monitoramento](#monitoramento)
10. [Deploy](#deploy)
11. [Diagramas](#diagramas)

## Visão Geral

O OdontoApp é um sistema backend para gerenciamento de clínicas odontológicas, desenvolvido com Node.js, TypeScript e Fastify. O sistema oferece funcionalidades para gerenciamento de pacientes, agendamentos, prontuários e comunicação.

## Arquitetura

O projeto segue uma arquitetura em camadas:

```
┌─────────────────┐
│    HTTP Layer   │  # Controladores e Rotas
└────────┬────────┘
         │
┌────────▼────────┐
│  Use Cases      │  # Lógica de Negócio
└────────┬────────┘
         │
┌────────▼────────┐
│  Repositories   │  # Acesso a Dados
└────────┬────────┘
         │
┌────────▼────────┐
│  Database       │  # PostgreSQL
└─────────────────┘
```

## Padrões de Projeto

O OdontoApp utiliza diversos padrões de projeto para manter o código organizado, testável e manutenível. Abaixo estão os principais padrões implementados:

### 1. Repository Pattern
Utilizado para abstrair a camada de acesso a dados.

```typescript
// src/repositories/patients-repository.ts
export interface PatientsRepository {
  create(data: CreatePatientDTO): Promise<Patient>
  findById(id: string): Promise<Patient | null>
  findByEmail(email: string): Promise<Patient | null>
  update(id: string, data: UpdatePatientDTO): Promise<Patient>
  delete(id: string): Promise<void>
}

// Implementação Prisma
export class PrismaPatientsRepository implements PatientsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePatientDTO): Promise<Patient> {
    return this.prisma.patient.create({ data })
  }
  // ... outros métodos
}
```

### 2. Factory Pattern
Utilizado para criar instâncias de classes de forma centralizada.

```typescript
// src/factories/make-create-appointment-use-case.ts
export function makeCreateAppointmentUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository(prisma)
  const patientsRepository = new PrismaPatientsRepository(prisma)
  const emailService = new NodemailerEmailService()
  
  return new CreateAppointmentUseCase(
    appointmentsRepository,
    patientsRepository,
    emailService
  )
}
```

### 3. Dependency Injection
Utilizado para injetar dependências nas classes.

```typescript
// src/use-cases/create-appointment.ts
export class CreateAppointmentUseCase {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private patientsRepository: PatientsRepository,
    private emailService: EmailService
  ) {}

  async execute(data: CreateAppointmentDTO) {
    // Lógica do caso de uso
  }
}
```

### 4. Strategy Pattern
Utilizado para diferentes estratégias de envio de email.

```typescript
// src/lib/email/email-service.ts
export interface EmailService {
  sendEmail(data: SendEmailDTO): Promise<void>
}

// Implementação Nodemailer
export class NodemailerEmailService implements EmailService {
  async sendEmail(data: SendEmailDTO): Promise<void> {
    // Implementação com Nodemailer
  }
}

// Implementação SendGrid (alternativa)
export class SendGridEmailService implements EmailService {
  async sendEmail(data: SendEmailDTO): Promise<void> {
    // Implementação com SendGrid
  }
}
```

### 5. Adapter Pattern
Utilizado para adaptar interfaces externas.

```typescript
// src/lib/adapters/sentry-error-adapter.ts
export class SentryErrorAdapter implements ErrorTracker {
  constructor(private sentry: typeof Sentry) {}

  captureException(error: Error): void {
    this.sentry.captureException(error)
  }

  captureMessage(message: string): void {
    this.sentry.captureMessage(message)
  }
}
```

### 6. Singleton Pattern
Utilizado para instâncias únicas de serviços.

```typescript
// src/lib/prisma.ts
export class PrismaClient {
  private static instance: PrismaClient

  private constructor() {
    // Inicialização do cliente Prisma
  }

  public static getInstance(): PrismaClient {
    if (!PrismaClient.instance) {
      PrismaClient.instance = new PrismaClient()
    }
    return PrismaClient.instance
  }
}
```

### 7. Observer Pattern
Utilizado para notificações de eventos.

```typescript
// src/lib/events/event-manager.ts
export class EventManager {
  private listeners: Map<string, Function[]> = new Map()

  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  notify(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach(callback => callback(data))
  }
}

// Uso em um caso de uso
export class CreateAppointmentUseCase {
  constructor(
    private eventManager: EventManager,
    // ... outras dependências
  ) {}

  async execute(data: CreateAppointmentDTO) {
    // ... lógica de criação
    this.eventManager.notify('appointment.created', appointment)
  }
}
```

### 8. Middleware Pattern
Utilizado para interceptar requisições HTTP.

```typescript
// src/http/middlewares/ensure-authenticated.ts
export const ensureAuthenticated: FastifyMiddleware = async (request, reply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('Token não fornecido')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    request.user = decoded

    return
  } catch (error) {
    return reply.status(401).send({ error: 'Não autorizado' })
  }
}
```

### 9. Command Pattern
Utilizado para encapsular operações em objetos.

```typescript
// src/use-cases/commands/create-appointment-command.ts
export class CreateAppointmentCommand {
  constructor(
    private data: CreateAppointmentDTO,
    private repository: AppointmentsRepository
  ) {}

  async execute(): Promise<Appointment> {
    // Lógica de criação do agendamento
    return this.repository.create(this.data)
  }
}
```

### 10. Value Object Pattern
Utilizado para representar conceitos do domínio.

```typescript
// src/domain/value-objects/email.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Result<Email> {
    if (!this.isValid(email)) {
      return Result.fail<Email>('Email inválido')
    }

    return Result.ok<Email>(new Email(email))
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  getValue(): string {
    return this.value
  }
}
```

## Tecnologias

- **Runtime**: Node.js 20.x
- **Framework**: Fastify
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Testes**: Vitest
- **Monitoramento**: Sentry
- **Email**: Nodemailer
- **Documentação**: Swagger/OpenAPI
- **Containerização**: Docker

## Configuração do Ambiente

### Variáveis de Ambiente

```env
NODE_ENV=dev
DATABASE_URL="postgresql://docker:docker@localhost:5432/odonto-app?schema=public"
JWT_SECRET="seu-segredo-jwt"
SENTRY_DSN="seu-dsn-sentry"

# Configuração de Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
SMTP_FROM=seu-email@gmail.com
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev        # Inicia o servidor em modo desenvolvimento
npm run studio     # Abre o Prisma Studio

# Build e Produção
npm run build      # Compila o projeto
npm run start      # Inicia o servidor em produção

# Testes
npm run test       # Executa os testes
npm run test:watch # Executa os testes em modo watch

# Utilitários
npm run seed       # Popula o banco com dados iniciais
npm run reminder-job # Executa o job de lembretes
npm run lint       # Executa o linter
```

## Estrutura do Projeto

```
OdontoApp_BackEnd/
├── src/
│   ├── app.ts                 # Configuração principal
│   ├── server.ts             # Ponto de entrada
│   ├── http/                 # Controladores e rotas
│   ├── use-cases/           # Casos de uso
│   ├── repositories/        # Acesso a dados
│   ├── lib/                 # Utilitários
│   ├── scripts/             # Scripts
│   ├── env/                 # Configurações
│   └── @types/              # Tipos TypeScript
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   ├── seed.ts             # Dados iniciais
│   └── migrations/         # Migrações
└── [configurações]
```

## Funcionalidades

### 1. Autenticação e Autorização
- Login com JWT
- Controle de acesso baseado em roles
- Refresh token

### 2. Gerenciamento de Pacientes
- CRUD completo de pacientes
- Histórico de atendimentos
- Prontuário eletrônico

### 3. Agendamento
- Marcação de consultas
- Sistema de lembretes por email
- Confirmação automática

### 4. Comunicação
- Envio de emails automáticos
- Lembretes de consultas
- Notificações de status

## Testes

### Testes Unitários
- Utiliza Vitest como framework
- Cobertura de código

### Executando Testes
```bash
# Todos os testes
npm run test

# Testes em modo watch
npm run test:watch

# Testes específicos
npm run test -- src/use-cases/create-appointment
```

## Monitoramento

### Sentry
- Monitoramento de erros em tempo real
- Rastreamento de performance
- Alertas configuráveis

### Logs
- Logs estruturados
- Níveis de log configuráveis
- Rotação de logs

## Deploy

### Docker
```dockerfile
# Build da imagem
docker build -t odontoapp .

# Execução
docker run -p 3333:3333 odontoapp
```

### Docker Compose
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres

  postgres:
    image: postgres:latest
    environment:
      - POSTGRES_USER=docker
      - POSTGRES_PASSWORD=docker
      - POSTGRES_DB=odonto-app
```

## Diagramas

### Diagrama de Classes
```mermaid
classDiagram
    class Controller {
        +handle()
    }
    class UseCase {
        +execute()
    }
    class Repository {
        +create()
        +find()
        +update()
        +delete()
    }
    Controller --> UseCase
    UseCase --> Repository
```

### Diagramas de Classes por Módulo

#### 1. Módulo de Autenticação
```mermaid
classDiagram
    class AuthController {
        +login()
        +register()
        +refreshToken()
    }
    class AuthUseCase {
        +authenticate()
        +validateToken()
        +createUser()
    }
    class UserRepository {
        +findByEmail()
        +create()
        +update()
    }
    class JWTService {
        +sign()
        +verify()
        +decode()
    }
    AuthController --> AuthUseCase
    AuthUseCase --> UserRepository
    AuthUseCase --> JWTService
```

#### 2. Módulo de Agendamento
```mermaid
classDiagram
    class AppointmentController {
        +create()
        +cancel()
        +list()
        +update()
    }
    class AppointmentUseCase {
        +schedule()
        +cancel()
        +reschedule()
    }
    class AppointmentRepository {
        +create()
        +findById()
        +findByDate()
        +update()
    }
    class NotificationService {
        +sendReminder()
        +sendConfirmation()
        +sendCancellation()
    }
    AppointmentController --> AppointmentUseCase
    AppointmentUseCase --> AppointmentRepository
    AppointmentUseCase --> NotificationService
```

#### 3. Módulo de Pacientes
```mermaid
classDiagram
    class PatientController {
        +create()
        +update()
        +findById()
        +list()
    }
    class PatientUseCase {
        +register()
        +update()
        +getHistory()
    }
    class PatientRepository {
        +create()
        +findById()
        +findByEmail()
        +update()
    }
    class MedicalRecord {
        +addNote()
        +getHistory()
        +updateStatus()
    }
    PatientController --> PatientUseCase
    PatientUseCase --> PatientRepository
    PatientUseCase --> MedicalRecord
```

#### 4. Módulo de Profissionais
```mermaid
classDiagram
    class ProfessionalController {
        +create()
        +update()
        +list()
        +getSchedule()
    }
    class ProfessionalUseCase {
        +register()
        +updateAvailability()
        +getAppointments()
    }
    class ProfessionalRepository {
        +create()
        +findById()
        +update()
    }
    class ScheduleService {
        +checkAvailability()
        +blockTime()
        +getAvailableSlots()
    }
    ProfessionalController --> ProfessionalUseCase
    ProfessionalUseCase --> ProfessionalRepository
    ProfessionalUseCase --> ScheduleService
```

#### 5. Módulo de Tratamentos
```mermaid
classDiagram
    class TreatmentController {
        +create()
        +update()
        +list()
        +getDetails()
    }
    class TreatmentUseCase {
        +register()
        +update()
        +calculatePrice()
    }
    class TreatmentRepository {
        +create()
        +findById()
        +update()
    }
    class PriceCalculator {
        +calculate()
        +applyDiscount()
        +validatePrice()
    }
    TreatmentController --> TreatmentUseCase
    TreatmentUseCase --> TreatmentRepository
    TreatmentUseCase --> PriceCalculator
```

#### 6. Módulo de Notificações
```mermaid
classDiagram
    class NotificationController {
        +send()
        +list()
        +markAsRead()
    }
    class NotificationUseCase {
        +create()
        +send()
        +processQueue()
    }
    class NotificationRepository {
        +create()
        +findByUser()
        +update()
    }
    class EmailService {
        +send()
        +validate()
        +format()
    }
    class SMSService {
        +send()
        +validate()
        +format()
    }
    NotificationController --> NotificationUseCase
    NotificationUseCase --> NotificationRepository
    NotificationUseCase --> EmailService
    NotificationUseCase --> SMSService
```

#### 7. Módulo de Administração
```mermaid
classDiagram
    class AdminController {
        +manageUsers()
        +manageSettings()
        +generateReports()
    }
    class AdminUseCase {
        +createUser()
        +updateSettings()
        +generateReport()
    }
    class AdminRepository {
        +createUser()
        +updateSettings()
        +getStatistics()
    }
    class ReportGenerator {
        +generateFinancial()
        +generateAttendance()
        +generatePerformance()
    }
    AdminController --> AdminUseCase
    AdminUseCase --> AdminRepository
    AdminUseCase --> ReportGenerator
```

#### 8. Módulo de Monitoramento
```mermaid
classDiagram
    class MonitoringController {
        +getMetrics()
        +getLogs()
        +getErrors()
    }
    class MonitoringUseCase {
        +trackError()
        +collectMetrics()
        +analyzePerformance()
    }
    class LogRepository {
        +create()
        +findByDate()
        +findByType()
    }
    class SentryAdapter {
        +captureException()
        +captureMessage()
        +setContext()
    }
    MonitoringController --> MonitoringUseCase
    MonitoringUseCase --> LogRepository
    MonitoringUseCase --> SentryAdapter
```

### Diagrama de Banco de Dados
```mermaid
erDiagram
    User ||--o{ Notification : receives
    User ||--|| Client : has
    User ||--|| Professional : has
    User ||--|| Administrator : has
    Professional }o--o{ Treatment : provides
    Client ||--o{ Consultation : schedules
    Professional ||--o{ Consultation : performs
    Treatment ||--o{ Consultation : includes

    User {
        string id
        string name
        string email
        string cpf
        string password
        string phone
        enum role
        datetime createdAt
        datetime updatedAt
    }

    Client {
        string id
        string userId
        datetime createdAt
        datetime updatedAt
    }

    Professional {
        string id
        string userId
        datetime createdAt
        datetime updatedAt
    }

    Administrator {
        string id
        string userId
        datetime createdAt
        datetime updatedAt
    }

    Treatment {
        string id
        string name
        string description
        int durationMinutes
        float price
        datetime createdAt
        datetime updatedAt
    }

    Consultation {
        string id
        string clientId
        string professionalId
        string treatmentId
        datetime dateTime
        enum status
        datetime createdAt
        datetime updatedAt
    }

    Notification {
        string id
        string userId
        string message
        boolean viewed
        datetime sentAt
        datetime createdAt
    }
```

### Diagrama de Casos de Uso
```mermaid
graph TD
    %% Atores
    A[Cliente]
    B[Profissional]
    C[Administrador]
    D[Sistema]

    %% Casos de Uso do Cliente
    A --> UC1[Agendar Consulta]
    A --> UC2[Cancelar Consulta]
    A --> UC3[Visualizar Histórico]
    A --> UC4[Receber Notificações]
    A --> UC5[Gerenciar Perfil]

    %% Casos de Uso do Profissional
    B --> UC6[Gerenciar Agenda]
    B --> UC7[Registrar Tratamento]
    B --> UC8[Atualizar Status Consulta]
    B --> UC9[Visualizar Prontuário]
    B --> UC10[Gerenciar Perfil]

    %% Casos de Uso do Administrador
    C --> UC11[Gerenciar Usuários]
    C --> UC12[Gerenciar Tratamentos]
    C --> UC13[Gerar Relatórios]
    C --> UC14[Configurar Sistema]

    %% Casos de Uso do Sistema
    D --> UC15[Enviar Lembretes]
    D --> UC16[Notificar Status]
    D --> UC17[Registrar Logs]
    D --> UC18[Monitorar Erros]

    %% Relacionamentos
    UC1 --> UC15
    UC1 --> UC16
    UC2 --> UC16
    UC7 --> UC17
    UC8 --> UC16
    UC11 --> UC17
    UC14 --> UC17
    UC15 --> UC18
    UC16 --> UC18
```

### Descrição dos Casos de Uso

#### Cliente
1. **Agendar Consulta**
   - Selecionar profissional
   - Escolher tratamento
   - Definir data e hora
   - Receber confirmação

2. **Cancelar Consulta**
   - Visualizar consultas agendadas
   - Selecionar consulta para cancelar
   - Confirmar cancelamento

3. **Visualizar Histórico**
   - Acessar histórico de consultas
   - Ver tratamentos realizados
   - Consultar prontuário

4. **Receber Notificações**
   - Receber lembretes de consulta
   - Notificações de status
   - Alertas do sistema

5. **Gerenciar Perfil**
   - Atualizar dados pessoais
   - Alterar senha
   - Configurar preferências

#### Profissional
6. **Gerenciar Agenda**
   - Visualizar consultas
   - Definir horários disponíveis
   - Ajustar agenda

7. **Registrar Tratamento**
   - Cadastrar novo tratamento
   - Atualizar informações
   - Definir preços

8. **Atualizar Status Consulta**
   - Marcar como realizada
   - Registrar observações
   - Atualizar prontuário

9. **Visualizar Prontuário**
   - Acessar histórico do paciente
   - Ver tratamentos anteriores
   - Consultar anotações

10. **Gerenciar Perfil**
    - Atualizar dados profissionais
    - Configurar especialidades
    - Gerenciar disponibilidade

#### Administrador
11. **Gerenciar Usuários**
    - Cadastrar novos usuários
    - Definir permissões
    - Bloquear/desbloquear acesso

12. **Gerenciar Tratamentos**
    - Cadastrar tratamentos
    - Definir preços
    - Atualizar descrições

13. **Gerar Relatórios**
    - Relatórios financeiros
    - Relatórios de atendimento
    - Estatísticas do sistema

14. **Configurar Sistema**
    - Configurar parâmetros
    - Gerenciar integrações
    - Definir políticas

#### Sistema
15. **Enviar Lembretes**
    - Lembretes de consulta
    - Notificações automáticas
    - Alertas do sistema

16. **Notificar Status**
    - Atualizações de consulta
    - Confirmações
    - Alertas importantes

17. **Registrar Logs**
    - Logs de acesso
    - Logs de operações
    - Logs de erro

18. **Monitorar Erros**
    - Captura de exceções
    - Monitoramento de performance
    - Alertas de sistema

## Contribuição

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 
