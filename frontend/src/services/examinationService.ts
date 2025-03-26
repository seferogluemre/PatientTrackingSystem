
import api from './api';

interface CreateExaminationData {
  appointment_id: number;
  treatment: string;
  diagnosis: string;
  notes?: string;
}

interface UpdateExaminationData {
  treatment?: string;
  diagnosis?: string;
  notes?: string;
}

export const addExamination = async (examinationData: CreateExaminationData) => {
  try {
    const response = await api.post('/examinations', examinationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExamination = async (id: number) => {
  try {
    const response = await api.get(`/examinations/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getDoctorExaminations = async (doctorId: number) => {
  try {
    console.log("DOKTOR SERVİS", doctorId)
    const response = await api.get(`/examinations/doctor/${doctorId}`);
    console.log("servis response", response.data)
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateExamination = async (id: number, examinationData: UpdateExaminationData) => {
  try {
    const response = await api.patch(`/examinations/${id}`, examinationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteExamination = async (id: number) => {
  try {
    const response = await api.delete(`/examinations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
