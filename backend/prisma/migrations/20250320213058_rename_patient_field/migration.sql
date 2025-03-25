/*
  Warnings:

  - You are about to drop the column `dob` on the `patients` table. All the data in the column will be lost.
  - Added the required column `birthDate` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "dob",
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL;
