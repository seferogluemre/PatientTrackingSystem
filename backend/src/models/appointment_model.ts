import { Prisma, PrismaClient } from "@prisma/client";
import { AppointmentStatus, CreateAppointmentBody, UpdateAppointmentBody } from "src/types";

const prisma = new PrismaClient();

export const createAppointment = async (body: CreateAppointmentBody) => {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: body.patient_id }
        });

        if (!patient) {
            throw new Error(`Patient with ID ${body.patient_id} not found`);
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: body.doctor_id }
        });

        if (!doctor) {
            throw new Error(`Doctor with ID ${body.doctor_id} not found`);
        }

        if (body.secretary_id) {

            const secretary = await prisma.secretary.findUnique({
                where: { id: body.secretary_id }
            });

            if (!secretary) {
                throw new Error(`Secretary with ID ${body.secretary_id} not found`);
            }
        }

        const appointment = await prisma.appointment.create({
            data: {
                patient_id: body.patient_id,
                doctor_id: body.doctor_id,
                appointment_date: new Date(body.date),
                status: body.status,
                description: body.description,
                secretaryId: body.secretary_id
            },
            select: {
                id: true,
                patient: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        tc_no: true
                    }
                },
                doctor: {
                    select: {
                        id: true,
                        specialty: true,
                        user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                email: true,
                                role: true,
                            }
                        }
                    }
                },
                appointment_date: true,
                status: true,
                description: true,
            },
        });
        return appointment;
    } catch (error) {
        console.error("Error creating appointment:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to create appointment: ${error.message}`);
        }
        throw new Error("Could not create appointment due to an unknown error");
    }
}

export const updateAppointment = async (appointmentId: number, body: UpdateAppointmentBody) => {
    try {
        if (!appointmentId) {
            return { message: "appointment id is required" }
        }
        let status;
        let completed_at = new Date();

        if (body.status === "completed") {
            status = new Date();
        }

        const appointment = await prisma.appointment.update({
            where: {
                id: appointmentId,
            },
            data: {
                appointment_date: body.data,
                status: body.status,
                completed_at: status
            },
        });
        return appointment;
    } catch (error) {
        console.error("Error updating appointment:", error);
        throw new Error("Could not update appointment.");
    }
};

export const deleteAppointment = async (appointmentId: number) => {
    try {
        if (!appointmentId) {
            return { message: "appointment id is required" }
        }
        await prisma.appointment.delete({
            where: {
                id: appointmentId,
            },
        });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        throw new Error("Could not delete appointment.");
    }
};

export const getAppointmentsByPatient = async (patientId: number) => {
    try {
        if (!patientId) {
            return { message: "patient id is required" };
        }

        // Önce users tablosunda bu patientId'yi arayalım
        const user = await prisma.user.findUnique({
            where: { id: patientId },
            select: { email: true }, // Sadece email bilgisini alıyoruz
        });

        if (!user) {
            return { message: "User not found" };
        }

        // Şimdi email adresi ile patients tablosunda sorgu atalım
        const patient = await prisma.patient.findUnique({
            where: { email: user.email },
            select: { id: true }, // Sadece id bilgisini alıyoruz
        });

        if (!patient) {
            return { message: "Patient not found" };
        }

        // Hastanın id'sine göre randevuları getiriyoruz
        const appointments = await prisma.appointment.findMany({
            where: {
                patient_id: patient.id,
            },
            include: {
                patient: true,
                doctor: true,
            },
        });

        return appointments;
    } catch (error) {
        console.error("Error getting appointments:", error);
        throw new Error("Could not fetch appointments.");
    }
};

export const getAppointments = async (status?: AppointmentStatus) => {
    const filter: Prisma.AppointmentWhereInput = {};
    if (status) {
        filter.status = status;
    }

    const appointments = await prisma.appointment.findMany({
        where: filter,
        include: {
            patient: true,
            doctor: {
                select: {
                    user: {
                        select: {
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            },
        },
    });

    return appointments;
}

export const getAppointmentByDoctor = async (doctorId: number) => {
    try {
        if (!doctorId) {
            return { message: "doctor id is required" };
        }

        // Önce users tablosunda bu patientId'yi arayalım
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });

        if (!doctor) {
            return { message: "Doctor not found" };
        }


        // Doktorun id'sine göre randevuları getiriyoruz
        const appointments = await prisma.appointment.findMany({
            where: {
                doctor_id: doctorId,
            },
            select: {
                id: true,
                doctor_id: true,
                patient_id: true,
                patient: true,
                examinations: true,
                description: true,
                appointment_date: true,
                completed_at: true,
                status: true,
            }
        });


        return appointments;
    } catch (error) {
        console.error("Error getting doctor appointments:", error);
        throw new Error("Could not fetch doctor appointments.");
    }
}