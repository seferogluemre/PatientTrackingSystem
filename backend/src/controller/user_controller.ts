import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Request, Response } from 'express'
import { CreateUserDto } from 'src/dto/user/CreateUserDto'
import { UpdateUserDto } from 'src/dto/user/UpdateUserDto'
import { createUser, deleteUserByTcno, getAllDoctors, getAllPatients, getUserByTcno, updateUserByTcno } from 'src/models/user_model'

export const addUser = async (req: Request, res: Response) => {
    try {
        const userDto = plainToInstance(CreateUserDto, req.body)

        const errros = await validate(userDto)

        if (errros.length > 1) {
            return res.status(403).json({
                message: "validation error",
                erorrs: errros.map(err => err.constraints)
            })
        }

        const createdUser = await createUser(userDto)

        return res.status(201).json({ message: "User Created Successfully", data: createdUser });
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        return res.status(500).json({
            erorr: (error as Error).message
        })
    }
}

export const getUser = async (req: Request, res: Response) => {
    try {
        const { tc } = req.params;

        if (!tc) {
            return { message: "tcno not found" }
        }

        const user = await getUserByTcno(tc)
        if (user) {
            return res.status(200).json({ data: user })
        }
        else {
            return res.status(200).json({ message: "user not found" })
        }
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        return res.status(500).json({
            erorr: (error as Error).message
        })
    }
}

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await getAllPatients();

        if (!patients || patients.length === 0) {
            return res.status(404).json({ message: "No patients found" });
        }

        return res.status(200).json({ results: patients }); // 'results' ile döndürülüyor
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({
            error: (error as Error).message
        });
    }
}

export const editUser = async (req: Request, res: Response) => {
    try {
        const { tc } = req.params;

        if (!tc || tc === null) {
            return { message: "tcno not found" }
        }

        const updateUserDto = plainToInstance(UpdateUserDto, req.body)

        const errors = await validate(updateUserDto)

        if (errors.length > 1) {
            return res.status(403).json({
                message: "validation error",
                erorrs: errors.map(err => err.constraints)
            })
        }

        const updatedUser = await updateUserByTcno(tc, updateUserDto)
        if (updatedUser) {
            return res.status(200).json({ message: "User Update Successfully", data: updatedUser })
        }
        else {
            return res.status(200).json({ message: "user not found" })
        }
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        return res.status(500).json({
            erorr: (error as Error).message
        })
    }
}

export const removeUser = async (req: Request, res: Response) => {
    try {
        const { tc } = req.params;

        if (!tc || tc === null) {
            return { message: "tcno not found" }
        }

        const removedUser = await deleteUserByTcno(tc)

        if (removedUser) {
            return res.status(200).json({ message: "User Delete Successfully", data: removedUser })
        }
        else {
            return res.status(200).json({ message: "user not found" })
        }
    } catch (error) {
        console.error("Error log:", (error as Error).message)
        return res.status(500).json({
            erorr: (error as Error).message
        })
    }
}

export const getDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await getAllDoctors();
        if (!doctors || doctors.length === 0) {
            return res.status(404).json({ message: "No doctors found" });
        }
        return res.status(200).json({ results: doctors });
    } catch (error) {
        console.error("Error log:", (error as Error).message);
        return res.status(500).json({
            error: (error as Error).message
        });
    }
}