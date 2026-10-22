import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`, // same as doing API_URL + '/api' but easier to read once string gets logner
  withCredentials: true, // important for handling cookies
});

apiClient.interceptors.request.use((config) => { // interceptor runs before every request
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;