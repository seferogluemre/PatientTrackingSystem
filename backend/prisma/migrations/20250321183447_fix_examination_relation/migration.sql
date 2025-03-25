-- DropForeignKey
ALTER TABLE "examinations" DROP CONSTRAINT "examinations_appointment_id_fkey";

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
