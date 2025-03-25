/*
  Warnings:

  - You are about to drop the column `examinationId` on the `appointments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_examinationId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "examinationId";

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
