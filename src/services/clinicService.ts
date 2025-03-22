
import api from './api';

interface CreateClinicData {
  name: string;
}

interface UpdateClinicData {
  name?: string;
}

export const addClinic = async (clinicData: CreateClinicData) => {
  try {
    const response = await api.post('/clinics', clinicData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getClinic = async (id: number) => {
  try {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateClinic = async (id: number, clinicData: UpdateClinicData) => {
  try {
    const response = await api.patch(`/clinics/${id}`, clinicData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteClinic = async (id: number) => {
  try {
    const response = await api.delete(`/clinics/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
