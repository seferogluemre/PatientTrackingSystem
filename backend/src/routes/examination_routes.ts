import { Router } from "express";
import { ExaminationController } from "src/controller/examination_controller";
import { CreateExaminationDto, UpdateExaminationDto } from "src/dto/ExaminationDto";
import { authMiddleware } from "src/middlewares/auth_middleware";
import { checkIdParam, validateDto } from "src/middlewares/examinationMiddleware";

const router = Router()

router.get('/', ExaminationController.index)
router.post('/', validateDto(CreateExaminationDto), ExaminationController.add)
router.patch('/:id', checkIdParam, validateDto(UpdateExaminationDto), ExaminationController.edit)
router.get('/:id', checkIdParam, ExaminationController.get)
router.delete('/:id', checkIdParam, ExaminationController.remove)
router.get('/doctor/:id', authMiddleware, ExaminationController.getDoctorIndex)

export default router;
