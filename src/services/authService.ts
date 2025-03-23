
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

    if (response.data.token || response.data.accessToken) {
      // Store all user data from response
      const token = response.data.token || response.data.accessToken;
      localStorage.setItem('clinicToken', token);
      
      // Create a normalized user object with both formats (snake_case and camelCase)
      const userData = response.data.user;
      const normalizedUser = {
        ...userData,
        // Add camelCase aliases if not present
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        tcNo: userData.tc_no || userData.tcNo
      };
      
      localStorage.setItem('clinicUser', JSON.stringify(normalizedUser));
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
