
import { Router } from "express";
import { addExamination, editExamination, getExamination, removeExamination } from "src/controller/examination_controller";

const router = Router()

router.post('/', addExamination)
router.patch('/:id', editExamination)
router.get('/:id', getExamination)
router.delete('/:id', removeExamination)


export default router;
