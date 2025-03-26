-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_clinic_id_fkey";

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
