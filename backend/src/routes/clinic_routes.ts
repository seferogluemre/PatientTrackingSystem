import { Router } from "express";
import { ClinicController } from "src/controller/clinic_controller";
import { CreateClinicDto, UpdateClinicDto } from "src/dto/ClinicDto";
import { checkIdParam, validateDto } from "src/middlewares/clinicMiddleware";

const router = Router()

router.get('/', ClinicController.index)
router.post('/', validateDto(CreateClinicDto), ClinicController.add)
router.patch('/:id', checkIdParam, validateDto(UpdateClinicDto), ClinicController.edit);
router.delete('/:id', checkIdParam, ClinicController.remove);
router.get('/:id', checkIdParam, ClinicController.get);





export default router;