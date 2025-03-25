/*
  Warnings:

  - You are about to drop the column `user_id` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `secretaries` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_user_id_fkey";

-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_user_id_fkey";

-- DropForeignKey
ALTER TABLE "secretaries" DROP CONSTRAINT "secretaries_user_id_fkey";

-- DropIndex
DROP INDEX "patients_user_id_key";

-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "secretaries" DROP COLUMN "user_id";

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_tc_no_fkey" FOREIGN KEY ("tc_no") REFERENCES "users"("tc_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_tc_no_fkey" FOREIGN KEY ("tc_no") REFERENCES "users"("tc_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretaries" ADD CONSTRAINT "secretaries_tc_no_fkey" FOREIGN KEY ("tc_no") REFERENCES "users"("tc_no") ON DELETE RESTRICT ON UPDATE CASCADE;
