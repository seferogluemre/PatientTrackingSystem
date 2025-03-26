import { Router } from "express";
import { addExamination, editExamination, getExamination, removeExamination, getDoctorExaminations, examinationList } from "src/controller/examination_controller";
import { CreateExaminationDto, UpdateExaminationDto } from "src/dto/ExaminationDto";
import { authMiddleware } from "src/middlewares/auth_middleware";
import { checkIdParam, validateDto } from "src/middlewares/examinationMiddleware";

const router = Router()

router.get('/', examinationList)
router.post('/', validateDto(CreateExaminationDto), addExamination)
router.patch('/:id', checkIdParam, validateDto(UpdateExaminationDto), editExamination)
router.get('/:id', checkIdParam, getExamination)
router.delete('/:id', checkIdParam, removeExamination)
router.get('/doctor/:id', authMiddleware, getDoctorExaminations)

export default router;
