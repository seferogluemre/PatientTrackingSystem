import { Router } from "express";
import { AppointmentController } from "src/controller/appointment_controller";
import { CreateAppointmentDto, UpdateAppointmentDto } from "src/dto/AppointmentDto";
import { checkIdParam, validateDto } from "src/middlewares/appointmentMiddleware";

const router = Router();

router.post('/', validateDto(CreateAppointmentDto), AppointmentController.add);
router.get('/doctor/:id', AppointmentController.listDoctorAppointments)
router.patch('/:id', checkIdParam, validateDto(UpdateAppointmentDto), AppointmentController.edit);
router.delete('/:id', checkIdParam, AppointmentController.remove);
router.get('/patient/:id', AppointmentController.listPatientAppointments);
router.get('/', AppointmentController.index)

export default router;