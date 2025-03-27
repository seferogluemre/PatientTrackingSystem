import { Request, Response } from "express"
import { ClinicService } from "src/models/clinic_model";

export const listClinics = async (req: Request, res: Response): Promise<void> => {
    try {

        const clinics = await ClinicService.getAll()

        if (!clinics) {
            res.status(404).json({ message: "Clinics not found" });
        }

        res.status(200).json({
            results: clinics
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
}

export const addClinic = async (req: Request, res: Response): Promise<void> => {
    try {
        const createdClinic = await ClinicService.create(req.body)

        res.status(201).json({ message: "Clinic Created Successfully", data: createdClinic });
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        res.status(500).json({
            erorr: (error as Error).message
        })
    }
}

export const editClinic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const clinicExists = await ClinicService.getById(Number(id))

        if (!clinicExists) {
            res.status(404).json({ message: "Clinic not found" });
        }

        const updatedClinic = await ClinicService.update(Number(id), req.body)

        res.status(200).json({
            message: "Clinic updated successfully",
            data: updatedClinic
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
}

export const removeClinic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const clinicExists = await ClinicService.getById(Number(id))

        if (!clinicExists) {
            res.status(404).json({ message: "Clinic not found" });
        }

        const deletedClinic = await ClinicService.delete(Number(id))

        res.status(200).json({ message: "Clinic deleted successfully", data: deletedClinic });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
}

export const getClinic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const clinic = await ClinicService.getById(Number(id))

        if (!clinic) {
            res.status(404).json({ message: "Clinic not found" });
        }

        res.status(200).json({
            message: "Clinic fetched successfully",
            data: clinic
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
}