import { Router } from "express";
import { addAppointment, editAppointment, listAppointments, listPatientAppointments, removeAppointment } from "src/controller/appointment_controller";

const router = Router();

router.post('/', addAppointment);
router.patch('/:id', editAppointment);
router.delete('/:id', removeAppointment);
router.get('/patient/:id', listPatientAppointments);
router.get('/', listAppointments)

export default router;