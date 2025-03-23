
import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/auth/login', credentials);

    console.log("Repsonse data:", response.data)
    console.log("User data:", response.data.user)

    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
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
