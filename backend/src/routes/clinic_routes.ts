import { Router } from "express";
import { addClinic, editClinic, getClinic, listClinic, removeClinic } from "src/controller/clinic_controller";
import { CreateClinicDto, UpdateClinicDto } from "src/dto/ClinicDto";
import { checkIdParam, validateDto } from "src/middlewares/clinicMiddleware";

const router = Router()

router.get('/', listClinic)
router.post('/', validateDto(CreateClinicDto), addClinic)
router.patch('/:id', checkIdParam, validateDto(UpdateClinicDto), editClinic);
router.delete('/:id', checkIdParam, removeClinic);
router.get('/:id', checkIdParam, getClinic);





export default router;