import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateAppointmentDto } from "src/dto/appointment/CreateAppointmentDto";
import { UpdateAppointmentDto } from "src/dto/appointment/UpdateAppointmentDto";
import { createAppointment, deleteAppointment, getAppointments, getAppointmentsByPatient, updateAppointment } from "src/models/appointment_model";
import { Request, Response } from "express";

export const addAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentDto = plainToInstance(CreateAppointmentDto, req.body);
        const errors = await validate(appointmentDto);

        if (errors.length > 0) {
            return res.status(403).json({
                message: "Validation error",
                errors: errors.map(err => err.constraints)
            });
        }

        const createdAppointment = await createAppointment(appointmentDto);
        return res.status(201).json({ message: "Appointment Created Successfully", data: createdAppointment });

    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
};

export const editAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Appointment ID not found" });
        }

        const updateAppointmentDto = plainToInstance(UpdateAppointmentDto, req.body);
        const errors = await validate(updateAppointmentDto);

        if (errors.length > 0) {
            return res.status(403).json({
                message: "Validation error",
                errors: errors.map(err => err.constraints)
            });
        }

        const updatedAppointment = await updateAppointment(Number(id), updateAppointmentDto);
        if (updatedAppointment) {
            return res.status(200).json({ message: "Appointment Updated Successfully", data: updatedAppointment });
        } else {
            return res.status(404).json({ message: "Appointment not found" });
        }

    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
};

export const removeAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Appointment ID not found" });
        }

        const deletedAppointment = await deleteAppointment(Number(id));
        return res.status(200).json({ message: "Appointment Deleted Successfully", data: deletedAppointment });

    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
};

export const listPatientAppointments = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Patient ID not found" });
        }

        const appointments = await getAppointmentsByPatient(Number(id));
        return res.status(200).json({ message: "Appointment List", results: appointments });

    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({ error: (error as Error).message });
    }
};

export const listAppointments = async (req: Request, res: Response) => {
    try {
        const status = req.query.status;

        const appointments = await getAppointments(status);
        res.status(200).json({ results: appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Could not fetch appointments." });
    }
}

