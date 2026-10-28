import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

const PUBLIC_PATHS = ['/auth/login/', '/auth/registration/'];

// attach the access token and skip public paths
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  const isPublic = PUBLIC_PATHS.some((path) => config.url.startsWith(path));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if several requests fail at once, they all wait for one refresh call
let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) throw new Error('No refresh token');

  // plain axios (not apiClient) so this call doesn't trigger our own interceptors
  const res = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh });
  localStorage.setItem('access', res.data.access);
  return res.data.access;
}

// on an expired token, refresh and retry once
apiClient.interceptors.response.use(
  (response) => response, // success: pass it through untouched
  async (error) => {
    const original = error.config;
    const isPublic = PUBLIC_PATHS.some((path) => original?.url?.startsWith(path));

    const tokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === 'token_not_valid';

    if (tokenExpired && !original._retry && !isPublic) {
      original._retry = true; // make sure we only retry each request once

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccess = await refreshPromise;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original); // retry the original request
      } catch (refreshError) {
        // refresh failed too: the user has to log in again
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;