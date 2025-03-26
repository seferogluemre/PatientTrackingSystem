import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { Request, Response } from "express"
import { CreateClinicDto } from "src/dto/clinic/CreateClinicDto"
import { UpdateClinicDto } from "src/dto/clinic/UpdateClinicDto"
import { createClinic, deleteClinic, getClinicById, getClinics, updateClinic } from "src/models/clinic_model"
export const addClinic = async (req: Request, res: Response) => {
    try {
        const clinicDto = plainToInstance(CreateClinicDto, req.body)

        const errors = await validate(clinicDto)

        if (errors.length > 0) {
            return res.status(403).json({
                message: "Validation error",
                errors: errors.map(err => err.constraints)
            });
        }

        const createdClinic = await createClinic(clinicDto)

        return res.status(201).json({ message: "Clinic Created Successfully", data: createdClinic });
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        return res.status(500).json({
            erorr: (error as Error).message
        })
    }
}

export const editClinic = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const clinicDto = plainToInstance(UpdateClinicDto, { ...req.body, id });

        const errors = await validate(clinicDto);
        if (errors.length > 0) {
            return res.status(403).json({
                message: "Validation error",
                errors: errors.map(err => err.constraints)
            });
        }
        const clinicExists = await getClinicById(Number(id))

        if (!clinicExists) {
            return res.status(404).json({ message: "Clinic not found" });
        }

        const updatedClinic = await updateClinic(Number(id), clinicDto)

        return res.status(200).json({
            message: "Clinic updated successfully",
            data: updatedClinic
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
}

export const removeClinic = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const clinicExists = await getClinicById(Number(id))

        if (!clinicExists) {
            return res.status(404).json({ message: "Clinic not found" });
        }

        const deletedClinic = await deleteClinic(Number(id))

        return res.status(200).json({ message: "Clinic deleted successfully", data: deletedClinic });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
}

export const getClinic = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const clinic = await getClinicById(Number(id))

        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }

        return res.status(200).json({
            message: "Clinic fetched successfully",
            data: clinic
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
}

export const listClinic = async (req: Request, res: Response) => {
    try {

        const clinics = await getClinics()

        if (!clinics) {
            return res.status(404).json({ message: "Clinics not found" });
        }

        return res.status(200).json({
            results: clinics
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
}
