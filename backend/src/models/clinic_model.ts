import { PrismaClient } from "@prisma/client";
import { CreateClinicBody, UpdateClinicBody } from "src/types";

const prisma = new PrismaClient()

export class ClinicService {
    static async getAll() {
        try {
            const clinics = await prisma.clinic.findMany();
            return clinics;
        } catch (error) {
            console.error("Error fetching clinic:", error);
            throw new Error("Could not fetch clinic due to an unknown error");
        }
    }
    static async create(body: CreateClinicBody) {
        try {
            const clinic = await prisma.clinic.create({
                data: {
                    name: body.name,
                },
                select: {
                    id: true,
                    name: true,
                }
            });
            return clinic;
        } catch (error) {

            console.error("Error creating clinic:", error);
            throw new Error("Could not create clinic due to an unknown error");
        }
    }
    static async update(id: number, body: UpdateClinicBody) {
        try {
            // Klinik var mı kontrolü
            const clinicExists = await prisma.clinic.findUnique({
                where: { id: id },
            });

            if (!clinicExists) {
                throw new Error("Clinic not found");
            }

            const updatedClinic = await prisma.clinic.update({
                where: { id: id },
                data: {
                    name: body.name,
                },
                select: {
                    id: true,
                    name: true,
                }
            });

            return updatedClinic;
        } catch (error) {
            console.error("Error updating clinic:", error);
            throw new Error("Could not update clinic due to an unknown error");
        }
    }
    static async delete(id: number) {
        try {
            const clinicExists = await this.getById(Number(id))

            if (!clinicExists) {
                throw new Error("Clinic not found");
            }

            const deletedClinic = await prisma.clinic.delete({
                where: { id: Number(id) },
            });

            return { message: "Clinic deleted successfully" };
        } catch (error) {
            console.error("Error deleting clinic:", error);
            throw new Error("Could not delete clinic due to an unknown error");
        }
    }
    static async getById(clinicId: number) {
        try {
            const clinic = await prisma.clinic.findUnique({
                where: {
                    id: Number(clinicId),
                },
                select: {
                    id: true,
                    name: true,
                }
            });

            if (!clinic) {
                throw new Error("Clinic not found");
            }

            return clinic;
        } catch (error) {
            console.error("Error fetching clinic:", error);
            throw new Error("Could not fetch clinic due to an unknown error");
        }
    }
}
