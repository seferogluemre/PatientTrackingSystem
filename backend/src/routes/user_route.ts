import { Router } from "express";
import { UserController } from "src/controller/user_controller";
import { CreateUserDto, UpdateUserDto } from "src/dto/UserDto";
import { checkTcParam, validateDto } from "src/middlewares/userMiddleware";

const router = Router()

router.get('/patients', UserController.getPatients)
router.get('/doctors', UserController.getDoctors)
router.post('/', validateDto(CreateUserDto), UserController.add)
router.get('/:tc', checkTcParam, UserController.get)
router.patch('/:tc', checkTcParam, validateDto(UpdateUserDto), UserController.edit)
router.delete('/:tc', checkTcParam, UserController.remove)

export default router;