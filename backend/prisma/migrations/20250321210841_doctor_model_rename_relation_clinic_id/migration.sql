-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_clinic_id_fkey";

-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "clinic_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
