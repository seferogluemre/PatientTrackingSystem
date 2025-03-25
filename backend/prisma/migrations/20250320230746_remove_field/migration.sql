/*
  Warnings:

  - You are about to drop the column `examinationId` on the `patients` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_examinationId_fkey";

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "examinationId";
