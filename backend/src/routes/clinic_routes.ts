import { Router } from "express";
import { addClinic, editClinic, getClinic, removeClinic } from "src/controller/clinic_controller";

const router = Router()

router.post('/', addClinic)
router.patch('/:id', editClinic);
router.delete('/:id', removeClinic);
router.get('/:id', getClinic);





export default router;