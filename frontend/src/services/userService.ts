
import api from './api';
import { User } from '@/types';

interface CreateUserData {
  first_name: string;
  last_name: string;
  tc_no: string;
  email: string;
  password: string;
  role: string;
  specialty?: string;
  clinic_id?: number;
  birthDate: string;
}

interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const addUser = async (userData: CreateUserData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUser = async (tcNo: string) => {
  try {
    const response = await api.get(`/users/${tcNo}`);
    console.log("User data:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (tcNo: string, userData: UpdateUserData) => {
  try {
    const response = await api.patch(`/users/${tcNo}`, userData);

    // Update user in localStorage to reflect changes
    const currentUser = JSON.parse(localStorage.getItem('clinicUser') || '{}');
    const updatedUser = {
      ...currentUser,
      ...userData,
      // Make sure both formats are updated
      first_name: userData.first_name || currentUser.first_name,
      last_name: userData.last_name || currentUser.last_name,
    };
    localStorage.setItem('clinicUser', JSON.stringify(updatedUser));

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (tcNo: string) => {
  try {
    const response = await api.delete(`/users/${tcNo}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPatients = async () => {
  try {
    const response = await api.get(`/users/patients`);
    return response.data.results;
  } catch (error) {
    throw error;
  }
};

export const getDoctors = async () => {
  try {
    const response = await api.get(`/users/doctors`);
    return response.data.results;
  } catch (error) {
    throw error;
  }
};
