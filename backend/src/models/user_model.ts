import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CreateUserBody, UpdateUserBody } from "src/types";

const prisma = new PrismaClient();

export class UserService {
    static async create(body: CreateUserBody) {
        if (!body.role || !body.tc_no) {
            throw new Error("Role and TC No are required.");
        }

        const hashedPassword = await bcrypt.hash(String(body.password), 10);

        try {
            const existingUser = await prisma.user.findUnique({
                where: { tc_no: body.tc_no }
            });

            if (existingUser) {
                throw new Error(`User with TC No ${body.tc_no} already exists.`);
            }

            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        password: hashedPassword,
                        tc_no: body.tc_no,
                        role: body.role,
                        birthDate: body.birthDate,
                    },
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        role: true,
                        joined_at: true,
                        tc_no: true,
                        birthDate: true,
                    }
                });

                if (user.role === "doctor") {
                    const specialty = body.specialty || body.specialty;
                    const clinicId = body.clinic_id;

                    if (!specialty || !clinicId) {
                        throw new Error("Specialty and clinic_id are required for doctor role");
                    }

                    const doctor = await tx.doctor.create({
                        data: {
                            tc_no: user.tc_no,
                            specialty: specialty,
                            clinic_id: Number(clinicId),
                        }
                    });
                    return { ...user, doctor };
                }

                else if (user.role === "secretary") {
                    const secretary = await tx.secretary.create({
                        data: {
                            tc_no: user.tc_no,
                        }
                    });
                    return { ...user, secretary };
                }

                else if (user.role === "patient") {
                    const patient = await tx.patient.create({
                        data: {
                            tc_no: user.tc_no,
                            email: body.email,
                            first_name: body.first_name,
                            last_name: body.last_name,
                        }
                    });
                    return { ...user, patient };
                }

                return user;
            });

            return result;
        } catch (error) {
            console.error("User creation failed:", error);
            if (error instanceof Error) {
                throw new Error(`Failed to create user: ${error.message}`);
            }
            throw new Error("Could not create user due to an unknown error");
        } finally {
            await prisma.$disconnect();
        }
    }

    static async getByTcno(tcNo: string) {
        if (!tcNo) {
            throw new Error("Tc No are required.");
        }

        try {
            const user = await prisma.user.findMany({
                where: {
                    tc_no: tcNo
                },
                select: {
                    first_name: true,
                    last_name: true,
                    tc_no: true,
                    email: true,
                    address: true,
                    phone: true,
                    role: true,
                    joined_at: true
                }
            })
            if (!user) {
                return { message: "user not found" }
            }
            return user;
        } catch (error) {
            console.error("Get User failed:", error);
            throw new Error("Could not get user.");
        } finally {
            await prisma.$disconnect();
        }
    }

    static async update(tcNo: string, body: UpdateUserBody) {
        if (!tcNo) {
            throw new Error("Tc No are required.");
        }
        const hashedPassword = await bcrypt.hash(String(body.password), 10);

        try {
            const updatedUser = await prisma.user.update({
                where: {
                    tc_no: tcNo
                },
                data: {
                    first_name: body.first_name,
                    last_name: body.last_name,
                    email: body.email,
                    password: String(hashedPassword),
                    phone: body.phone,
                    address: body.address
                },
                select: {
                    first_name: true,
                    last_name: true,
                    tc_no: true,
                    email: true,
                    address: true,
                    phone: true,
                    role: true,
                    joined_at: true
                }
            })

            if (!updatedUser) {
                return { message: "could not update user" }
            }
            return updatedUser;
        } catch (error) {
            console.error("could not update User failed:", error);
            throw new Error("Could not update user failed.");
        } finally {
            await prisma.$disconnect();
        }
    }

    static async delete(tcNo: string) {
        if (!tcNo) {
            throw new Error("Tc No are required.");
        }

        try {
            const deletedUser = await prisma.user.delete({
                where: {
                    tc_no: tcNo
                },
                select: {
                    first_name: true,
                    last_name: true,
                }
            })

            if (!deletedUser) {
                return { message: "could not delete user" }
            }
            return deletedUser;
        } catch (error) {
            console.error("could not delete User failed:", error);
            throw new Error("Could not delete user failed.");
        } finally {
            await prisma.$disconnect();
        }
    }

    static async getPatients() {
        try {
            const patients = await prisma.patient.findMany({
                select: {
                    email: true,
                    first_name: true,
                    tc_no: true,
                    appointments: true,
                    last_name: true,
                    id: true,
                    user: {
                        select: {
                            birthDate: true,
                            joined_at: true,
                        }
                    }
                }
            });
            console.log("Patients fetched:", patients);
            return patients;
        } catch (error) {
            console.error("could get list Users failed:", error);
            throw new Error("could get list Users failed.");
        } finally {
            await prisma.$disconnect();
        }
    }

    static async getDoctors() {
        try {
            const doctors = await prisma.doctor.findMany({
                select: {
                    tc_no: true,
                    id: true,
                    specialty: true,
                    user: {
                        select: {
                            address: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                            role: true,
                            phone: true,
                        }
                    }
                }
            });
            console.log("doctors fetched:", doctors);
            return doctors;
        } catch (error) {
            console.error("could get list doctors failed:", error);
            throw new Error("could get list doctors failed.");
        } finally {
            await prisma.$disconnect();
        }
    }

    static async getSecretaryByTcno(tc_no: string) {
        try {
            const secretary = await prisma.secretary.findUnique({
                where: {
                    tc_no: tc_no, // secretary tablosunda userId alanı varsa
                },
                select: {
                    id: true
                }
            });

            return secretary;
        } catch (error) {
            console.error("Sekreter bilgisi alınırken hata oluştu:", error);
            throw new Error("Sekreter bilgisi alınamadı");
        }
    }
}