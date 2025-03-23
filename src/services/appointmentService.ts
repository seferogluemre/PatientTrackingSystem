
import api from './api';
import { Appointment } from '@/types';

interface CreateAppointmentData {
  patient_id: number;
  doctor_id: number;
  date: string;
  status: string;
  description: string;
  secretary_id?: number;
}

interface UpdateAppointmentData {
  status?: string;
  date?: string;
  description?: string;
}

export const addAppointment = async (appointmentData: CreateAppointmentData) => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editAppointment = async (id: number, appointmentData: UpdateAppointmentData) => {
  try {
    const response = await api.patch(`/appointments/${id}`, appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeAppointment = async (id: number) => {
  try {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPatientAppointments = async (patientId: number) => {
  try {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDoctorAppointments = async (doctorId: number) => {
  try {
    const response = await api.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllAppointments = async () => {
  try {
    const response = await api.get('/appointments');
    return response.data;
  } catch (error) {
    throw error;
  }
};
