import { ConsultationRepository } from "@/repositories/consultation-repository";
import { Consultation } from "@prisma/client";
import { NotAuthorizedError } from "../@errors/not-authorized-error";
import { UsersRepository } from "@/repositories/users-repository";

interface ListConsultationsUseCaseResponse {
  consultations: Consultation[];
}

interface ListConsultationUseCaseRequest {
  authenticatedUserId: string;
}

export class ListConsultationsUseCase {
  constructor(
    private consultationRepository: ConsultationRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({
    authenticatedUserId,
  }: ListConsultationUseCaseRequest): Promise<ListConsultationsUseCaseResponse> {
    const authenticatedUser =
      await this.usersRepository.findById(authenticatedUserId);

    if (!authenticatedUser) {
      throw new NotAuthorizedError();
    }

    if (!authenticatedUser) {
      throw new NotAuthorizedError();
    }

    if (authenticatedUser.role === "ADMIN") {
      const consultations = await this.consultationRepository.findMany();
      return { consultations };
    }

    throw new NotAuthorizedError();
  }
}

