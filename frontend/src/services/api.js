import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.statusCode = response.data?.statusCode || response.status;
    return response;
  },
  (error) => {
    if (error.response) {
      error.statusCode = error.response.data?.statusCode || error.response.status;
      error.statusMessage = error.response.data?.message || error.message;
    }
    return Promise.reject(error);
  }
);

export default api;
