import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface CreateClinicBody {
    name: string
}
interface UpdateClinicBody {
    name: string;
}

export const createClinic = async (body: CreateClinicBody) => {
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

export const getClinicById = async (clinicId: number) => {
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

export const updateClinic = async (id: number, body: UpdateClinicBody) => {
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

export const deleteClinic = async (id: number) => {
    try {
        const clinicExists = await getClinicById(Number(id))

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
