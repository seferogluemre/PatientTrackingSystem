import { PrismaClient } from "@prisma/client";
import { CreateExaminationBody, UpdateExaminationBody } from "src/types";

const prisma = new PrismaClient();

export class ExaminationService {
    static async create(body: CreateExaminationBody) {
        try {
            const createdExamination = await prisma.examination.create({
                data: {
                    appointment_id: body.appointment_id,
                    treatment: body.treatment,
                    diagnosis: body.diagnosis,
                    notes: body.notes || "Not Eklenmedi"
                },
                select: {
                    id: true,
                    appointment_id: true,
                    diagnosis: true,
                    treatment: true,
                    notes: true,
                }
            })
            return createdExamination;
        } catch (error) {
            console.error("Error creating Examination:", error);
            throw new Error("Could not create Examination.");
        }
    }

    static async update(id: number, body: UpdateExaminationBody) {
        try {
            if (!id) {
                return { message: "examination id is required" }
            }

            const updatedExamination = await prisma.examination.update({
                where: {
                    id: id
                },
                data: {
                    notes: body.notes,
                    diagnosis: body.diagnosis,
                    treatment: body.treatment
                }
            })

            return updatedExamination;
        } catch (error) {
            console.error("Error updating Examination:", error);
            throw new Error("Could not update Examination.");
        }
    }

    static async getById(id: number) {
        try {
            const examination = await prisma.examination.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    appointment_id: true,
                    diagnosis: true,
                    treatment: true,
                    notes: true,
                    appointment: {
                        select: {
                            id: true,
                            patient_id: true,
                            doctor_id: true,
                            appointment_date: true,
                            status: true,
                            description: true,
                            patient: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true
                                }
                            },
                            doctor: {
                                select: {
                                    id: true,
                                    specialty: true,
                                    user: {
                                        select: {
                                            first_name: true,
                                            last_name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!examination) {
                throw new Error("Examination not found");
            }

            return examination;
        } catch (error) {
            console.error("Error getting Examination:", error);
            throw new Error("Could not retrieve Examination.");
        }
    }

    static async delete(id: number) {
        try {
            const deletedExamination = await prisma.examination.delete({
                where: { id: id },
                select: {
                    id: true,
                    appointment_id: true,
                    diagnosis: true,
                    treatment: true,
                    notes: true
                }
            });

            return deletedExamination;
        } catch (error) {
            console.error("Error deleting Examination:", error);
            throw new Error("Could not delete Examination.");
        }
    }

    static async getByDoctorId(doctorId: number) {
        try {
            const existingDoctor = await prisma.user.findUnique({
                where: {
                    id: doctorId
                },
                select: {
                    tc_no: true
                }
            });

            if (!existingDoctor) {
                throw new Error("Doktor bulunamadı.");
            }

            const doctorTcNo = existingDoctor.tc_no;

            const doctor = await prisma.doctor.findUnique({
                where: {
                    tc_no: doctorTcNo
                },
                select: {
                    id: true
                }
            });

            if (!doctor) {
                throw new Error("Doktor (doctor tablosunda) bulunamadı.");
            }

            const doctorDbId = doctor.id;

            const examinations = await prisma.examination.findMany({
                where: {
                    appointment: {
                        doctor_id: doctorDbId  // Burada artık doğru id kullanılıyor
                    }
                },
                include: {
                    appointment: {
                        select: {
                            id: true,
                            patient_id: true,
                            doctor_id: true,
                            appointment_date: true,
                            status: true,
                            description: true,
                            patient: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true
                                }
                            },
                            doctor: {
                                select: {
                                    id: true,
                                    specialty: true,
                                    user: {
                                        select: {
                                            first_name: true,
                                            last_name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    id: 'desc'
                }
            });

            console.log("Bulunan muayeneler:", examinations);

            return examinations;
        } catch (error) {
            console.error("Error getting examinations by doctor ID:", error);
            throw new Error("Could not retrieve examinations.");
        }
    }

    static async getAll() {
        try {
            const examinations = await prisma.examination.findMany();
            return examinations;
        } catch (error) {
            console.error("Error getting examinations:", error);
            throw new Error("Could not Error getting examinations.");
        }
    }
}
