
import api from './api';
import { User } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Token ve kullanıcı bilgilerini localStorage'a kaydet
    if (response.data.token) {
      localStorage.setItem('clinicToken', response.data.token);
      localStorage.setItem('clinicUser', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('clinicToken');
    localStorage.removeItem('clinicUser');
    return { success: true };
  } catch (error) {
    // Token zaten geçersiz olsa bile local storage'ı temizle
    localStorage.removeItem('clinicToken');
    localStorage.removeItem('clinicUser');
    throw error;
  }
};
