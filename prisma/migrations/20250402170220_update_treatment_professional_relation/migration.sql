/*
  Warnings:

  - You are about to drop the column `professionalId` on the `Treatment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Treatment" DROP CONSTRAINT "Treatment_professionalId_fkey";

-- AlterTable
ALTER TABLE "Treatment" DROP COLUMN "professionalId";

-- CreateTable
CREATE TABLE "_TreatmentToProfessional" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TreatmentToProfessional_AB_unique" ON "_TreatmentToProfessional"("A", "B");

-- CreateIndex
CREATE INDEX "_TreatmentToProfessional_B_index" ON "_TreatmentToProfessional"("B");

-- AddForeignKey
ALTER TABLE "_TreatmentToProfessional" ADD CONSTRAINT "_TreatmentToProfessional_A_fkey" FOREIGN KEY ("A") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TreatmentToProfessional" ADD CONSTRAINT "_TreatmentToProfessional_B_fkey" FOREIGN KEY ("B") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
