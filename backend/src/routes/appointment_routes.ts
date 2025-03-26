import { Router } from "express";
import { addAppointment, editAppointment, listAppointments, listDoctorAppointments, listPatientAppointments, removeAppointment } from "src/controller/appointment_controller";
import { CreateAppointmentDto, UpdateAppointmentDto } from "src/dto/AppointmentDto";
import { checkIdParam, validateDto } from "src/middlewares/appointmentMiddleware";

const router = Router();

router.post('/', validateDto(CreateAppointmentDto), addAppointment);
router.get('/doctor/:id', listDoctorAppointments)
router.patch('/:id', checkIdParam, validateDto(UpdateAppointmentDto), editAppointment);
router.delete('/:id', checkIdParam, removeAppointment);
router.get('/patient/:id', listPatientAppointments);
router.get('/', listAppointments)

export default router;