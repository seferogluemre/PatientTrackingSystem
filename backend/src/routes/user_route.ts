import { Router } from "express";
import { addUser, editUser, getDoctors, getPatients, getUser, removeUser } from "src/controller/user_controller";
import { CreateUserDto, UpdateUserDto } from "src/dto/UserDto";
import { checkTcParam, validateDto } from "src/middlewares/userMiddleware";

const router = Router()

router.get('/patients', getPatients)
router.get('/doctors', getDoctors)
router.post('/', validateDto(CreateUserDto), addUser)
router.get('/:tc', checkTcParam, getUser)
router.patch('/:tc', checkTcParam, validateDto(UpdateUserDto), editUser)
router.delete('/:tc', checkTcParam, removeUser)

export default router;