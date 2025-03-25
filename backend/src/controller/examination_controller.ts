import { plainToInstance } from "class-transformer"
import { validate } from "class-validator";
import { Request, Response } from "express"
import { CreateExaminationDto } from "src/dto/examination/CreateExaminationDto"
import { UpdateExaminationDto } from "src/dto/examination/UpdateExaminationDto";
import { createExamination, updateExamination, deleteExamination, getExaminationById, getExaminationsByDoctorId } from "src/models/examination_model";

export const addExamination = async (req: Request, res: Response) => {
    try {
        const examinationDto = plainToInstance(CreateExaminationDto, req.body);

        const errors = await validate(examinationDto)

        if (errors.length > 0) {
            return res.status(403).json({
                message: "Validation Error",
                error: errors.map(err => err.constraints)
            })
        }

        const createdExamination = await createExamination(examinationDto);

        return res.status(201).json({
            message: "Examination Created Successfully",
            data: createdExamination
        })
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        return res.status(500).json({
            error: (error as Error).message
        })
    }
}

export const editExamination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "examination id required "
            })
        }

        const examinationDto = plainToInstance(UpdateExaminationDto, req.body);

        const errors = await validate(examinationDto);

        if (errors.length > 0) {
            return res.status(403).json({
                message: "Validation Error",
                error: errors.map(err => err.constraints)
            })
        }

        const updatedExamination = await updateExamination(Number(id), examinationDto);

        return res.status(200).json({
            message: "Examination Updated Successfully",
            data: updatedExamination
        })
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        return res.status(500).json({
            error: (error as Error).message
        })
    }
}

export const getExamination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Examination id required"
            });
        }

        const examination = await getExaminationById(Number(id));

        if (!examination) {
            return res.status(404).json({
                message: "Examination not found"
            });
        }

        return res.status(200).json({
            message: "Examination Retrieved Successfully",
            data: examination
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({
            error: (error as Error).message
        });
    }
};

export const removeExamination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Examination id required"
            });
        }

        const deletedExamination = await deleteExamination(Number(id));

        if (!deletedExamination) {
            return res.status(404).json({
                message: "Examination not found"
            });
        }

        return res.status(200).json({
            message: "Examination Deleted Successfully",
            data: deletedExamination
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({
            error: (error as Error).message
        });
    }
};

export const getDoctorExaminations = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Doctor id required"
            });
        }

        const examinations = await getExaminationsByDoctorId(Number(id));

        return res.status(200).json({
            message: "Examinations Retrieved Successfully",
            data: examinations
        });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({
            error: (error as Error).message
        });
    }
};
