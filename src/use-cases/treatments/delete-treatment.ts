import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { ResourceHasDependenciesError } from '@/use-cases/@errors/resource-has-dependencies-error'
import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Prisma } from '@prisma/client'

interface DeleteTreatmentUseCaseRequest {
  id: string
}

type DeleteTreatmentUseCaseResponse = void

export class DeleteTreatmentUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    id,
  }: DeleteTreatmentUseCaseRequest): Promise<DeleteTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.findById(id)

    if (!treatment) {
      throw new ResourceNotFoundError()
    }

    try {
      await this.treatmentsRepository.delete(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ResourceHasDependenciesError('tratamento')
        }
      }
      throw error
    }
  }
}
