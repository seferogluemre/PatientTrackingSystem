
import { Router } from "express";
import { addExamination, editExamination, getExamination, removeExamination, getDoctorExaminations, examinationList } from "src/controller/examination_controller";
import { authMiddleware } from "src/middlewares/auth_middleware";

const router = Router()

router.get('/', examinationList)
router.post('/', addExamination)
router.patch('/:id', editExamination)
router.get('/:id', getExamination)
router.delete('/:id', removeExamination)
router.get('/doctor/:id', authMiddleware, getDoctorExaminations)

export default router;
