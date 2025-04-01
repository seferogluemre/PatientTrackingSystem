import { Request, Response } from "express"
import { ExaminationService } from "src/models/examination_model";

export class ExaminationController {
    static async index(req: Request, res: Response): Promise<void> {
        try {
            const examinations = await ExaminationService.getAll();

            if (examinations.length > 0) {
                res.status(200).json({ results: examinations })
            }

            res.status(200).json({
                message: "Examination list Successfully",
                results: examinations
            });
        } catch (error) {
            console.error("Error log:", (error as Error).message)
            res.status(500).json({
                error: (error as Error).message
            })
        }
    }

    static async add(req: Request, res: Response): Promise<void> {
        try {
            const createdExamination = await ExaminationService.create(req.body);

            res.status(201).json({
                message: "Examination Created Successfully",
                data: createdExamination
            })
        } catch (error) {
            console.error("Error log:", (error as Error).message)
            res.status(500).json({
                error: (error as Error).message
            })
        }
    }

    static async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    message: "Examination id required"
                });
            }

            const examination = await ExaminationService.getById(Number(id));

            if (!examination) {
                res.status(404).json({
                    message: "Examination not found"
                });
            }

            res.status(200).json({
                message: "Examination Retrieved Successfully",
                data: examination
            });
        } catch (error) {
            console.error("Error log:", (error as Error).message);
            res.status(500).json({
                error: (error as Error).message
            });
        }
    }

    static async edit(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const updatedExamination = await ExaminationService.update(Number(id), req.body);

            res.status(200).json({
                message: "Examination Updated Successfully",
                data: updatedExamination
            })
        } catch (error) {
            console.error("Error log:", (error as Error).message)
            res.status(500).json({
                error: (error as Error).message
            })
        }
    }

    static async remove(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    message: "Examination id required"
                });
            }

            const deletedExamination = await ExaminationService.delete(Number(id));

            if (!deletedExamination) {
                res.status(404).json({
                    message: "Examination not found"
                });
            }

            res.status(200).json({
                message: "Examination Deleted Successfully",
                data: deletedExamination
            });
        } catch (error) {
            console.error("Error log:", (error as Error).message);
            res.status(500).json({
                error: (error as Error).message
            });
        }
    }

    static async getDoctorIndex(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    message: "Doctor id required"
                });
            }

            const examinations = await ExaminationService.getByDoctorId(Number(id));

            res.status(200).json({
                message: "Examinations Retrieved Successfully",
                data: examinations
            });
        } catch (error) {
            console.error("Error log:", (error as Error).message);
            res.status(500).json({
                error: (error as Error).message
            });
        }
    }
}
