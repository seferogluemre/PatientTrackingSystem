
import api from './api';

interface CreateAppointmentData {
  doctorId: number;
  patientId: number;
  date: Date;
  description?: string;
}

interface UpdateAppointmentData {
  status?: 'pending' | 'completed' | 'cancelled';
  date?: Date;
}

export const createAppointment = async (appointmentData: CreateAppointmentData) => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAppointment = async (id: number) => {
  try {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getPatientAppointments = async (patientId: number) => {
  try {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return {
      results: response.data
    };
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

export const editAppointment = async (id: number, data: UpdateAppointmentData) => {
  try {
    const response = await api.patch(`/appointments/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelAppointment = async (id: number) => {
  try {
    const response = await api.patch(`/appointments/${id}`, { status: 'cancelled' });
    return response.data;
  } catch (error) {
    throw error;
  }
};
