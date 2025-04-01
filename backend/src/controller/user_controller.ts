import { Request, Response } from 'express'
import { UserService } from 'src/models/user_model';


export class UserController {
    static async add(req: Request, res: Response): Promise<void> {
        try {
            const createdUser = await UserService.create(req.body);
            res.status(201).json({ message: "User Created Successfully", data: createdUser });
        } catch (error) {
            console.error("Error log:", (error as Error).message);
            res.status(500).json({
                error: (error as Error).message
            });
        }
    }

    static async get(req: Request, res: Response): Promise<void> {
        try {
            const { tc } = req.params;

            if (!tc) {
                { message: "tcno not found" }
            }

            const user = await UserService.getByTcno(tc)
            if (user) {
                res.status(200).json({ data: user })
            }
            else {
                res.status(200).json({ message: "user not found" })
            }
        } catch (error) {
            console.error("Error log:", (error as Error).message)
            res.status(500).json({
                erorr: (error as Error).message
            })
        }
    }

    static async getPatients(req: Request, res: Response): Promise<void> {
        try {
            const patients = await UserService.getPatients();

            if (!patients || patients.length === 0) {
                res.status(404).json({ message: "No patients found" });
            }

            res.status(200).json({ results: patients }); // 'results' ile döndürülüyor
        } catch (error) {
            console.error("Error log:", (error as Error).message);
            res.status(500).json({
                error: (error as Error).message
            });
        }
    }

    static async edit(req: Request, res: Response): Promise<void> {
        try {
            const { tc } = req.params;

            const updatedUser = await UserService.update(tc, req.body);

            if (updatedUser) {
                res.status(200).json({ message: "User Updated Successfully", data: updatedUser });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error("Error log:", (error as Error).message);

        }
    }

    static async remove(req: Request, res: Response): Promise<void> {
        try {
            const { tc } = req.params;

            if (!tc || tc === null) {
                { message: "tcno not found" }
            }

            const removedUser = await UserService.delete(tc)

            if (removedUser) {
                res.status(200).json({ message: "User Delete Successfully", data: removedUser })
            }
            else {
                res.status(200).json({ message: "user not found" })
            }
        } catch (error) {
            console.error("Error log:", (error as Error).message)
            res.status(500).json({
                erorr: (error as Error).message
            })
        }
    }

    static async getDoctors(req: Request, res: Response): Promise<void> {
        try {
            const doctors = await UserService.getDoctors();
            if (!doctors || doctors.length === 0) {
                res.status(404).json({ message: "No doctors found" });
            }
            res.status(200).json({ results: doctors });
        } catch (error) {
            console.error("Error log:", (error as Error).message);
            res.status(500).json({
                error: (error as Error).message
            });
        }
    }

};
