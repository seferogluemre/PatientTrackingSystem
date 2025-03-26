import { Router } from "express";
import { addAppointment, editAppointment, listAppointments, listDoctorAppointments, listPatientAppointments, removeAppointment } from "src/controller/appointment_controller";

const router = Router();

router.post('/', addAppointment);
router.get('/doctor/:id', listDoctorAppointments)
router.patch('/:id', editAppointment);
router.delete('/:id', removeAppointment);
router.get('/patient/:id', listPatientAppointments);
router.get('/', listAppointments)

export default router;