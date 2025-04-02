import { Prisma, Treatment } from '@prisma/client'

export interface TreatmentsRepository {
  findById(id: string): Promise<Treatment | null>
  findByProfessionalId(professionalId: string): Promise<Treatment[]>
  findMany(): Promise<Treatment[]>
  create(data: Prisma.TreatmentCreateInput): Promise<Treatment>
  update(id: string, data: Prisma.TreatmentUpdateInput): Promise<Treatment>
  delete(id: string): Promise<void>
  addProfessional(
    treatmentId: string,
    professionalId: string,
  ): Promise<Treatment>
  removeProfessional(
    treatmentId: string,
    professionalId: string,
  ): Promise<Treatment>
}
