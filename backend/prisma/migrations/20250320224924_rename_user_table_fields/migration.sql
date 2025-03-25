/*
  Warnings:

  - You are about to drop the column `address` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "address",
DROP COLUMN "birthDate",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthDate" TIMESTAMP(3);
