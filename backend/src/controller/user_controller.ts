import { Request, Response } from 'express'
import { createUser, deleteUserByTcno, getAllDoctors, getAllPatients, getUserByTcno, updateUserByTcno } from 'src/models/user_model'

export const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const createdUser = await createUser(req.body);
        res.status(201).json({ message: "User Created Successfully", data: createdUser });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        res.status(500).json({
            error: (error as Error).message
        });
    }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tc } = req.params;

        if (!tc) {
            { message: "tcno not found" }
        }

        const user = await getUserByTcno(tc)
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

export const getPatients = async (req: Request, res: Response): Promise<void> => {
    try {
        const patients = await getAllPatients();

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

export const editUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tc } = req.params;

        const updatedUser = await updateUserByTcno(tc, req.body);

        if (updatedUser) {
            res.status(200).json({ message: "User Updated Successfully", data: updatedUser });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const removeUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tc } = req.params;

        if (!tc || tc === null) {
            { message: "tcno not found" }
        }

        const removedUser = await deleteUserByTcno(tc)

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

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctors = await getAllDoctors();
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