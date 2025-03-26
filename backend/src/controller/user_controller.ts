import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Request, Response } from 'express'
import { CreateUserDto, UpdateUserDto } from 'src/dto/UserDto'
import { createUser, deleteUserByTcno, getAllDoctors, getAllPatients, getUserByTcno, updateUserByTcno } from 'src/models/user_model'

export const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userDto = plainToInstance(CreateUserDto, req.body)

        const errros = await validate(userDto)

        if (errros.length > 1) {
            res.status(403).json({
                message: "validation error",
                erorrs: errros.map(err => err.constraints)
            })
        }

        const createdUser = await createUser(userDto)

        res.status(201).json({ message: "User Created Successfully", data: createdUser });
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        res.status(500).json({
            erorr: (error as Error).message
        })
    }
}

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

        if (!tc || tc === null) {
            { message: "tcno not found" }
        }

        const updateUserDto = plainToInstance(UpdateUserDto, req.body)

        const errors = await validate(updateUserDto)

        if (errors.length > 1) {
            res.status(403).json({
                message: "validation error",
                erorrs: errors.map(err => err.constraints)
            })
        }

        const updatedUser = await updateUserByTcno(tc, updateUserDto)
        if (updatedUser) {
            res.status(200).json({ message: "User Update Successfully", data: updatedUser })
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