import apiClient from './apiClient';

const authService = {
  signup: async (userData) => {
    try {
      const response = await apiClient.post(
        '/api/auth/register/',
        userData
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
