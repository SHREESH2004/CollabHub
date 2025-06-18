import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://collabhub-8omu.onrender.com",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Use 'authToken' instead of 'token'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
