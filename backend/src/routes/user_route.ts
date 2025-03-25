import { Router } from "express";
import { addUser, editUser, getDoctors, getPatients, getUser, removeUser } from "src/controller/user_controller";

const router = Router()

router.get('/patients', getPatients)
router.get('/doctors', getDoctors)
router.post('/', addUser)
router.get('/:tc', getUser)
router.patch('/:tc', editUser)
router.delete('/:tc', removeUser)

export default router;