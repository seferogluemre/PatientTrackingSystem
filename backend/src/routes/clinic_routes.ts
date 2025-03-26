import { Router } from "express";
import { addClinic, editClinic, getClinic, listClinic, removeClinic } from "src/controller/clinic_controller";

const router = Router()

router.get('/', listClinic)
router.post('/', addClinic)
router.patch('/:id', editClinic);
router.delete('/:id', removeClinic);
router.get('/:id', getClinic);





export default router;