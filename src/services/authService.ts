
import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/auth/login', credentials);

    console.log("Response data:", response.data);
    console.log("User data:", response.data.user);

    if (response.data.token) {
      // Store the complete user object in localStorage
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
    // Token may already be invalid, but clear localStorage anyway
    localStorage.removeItem('clinicToken');
    localStorage.removeItem('clinicUser');
    throw error;
  }
};
