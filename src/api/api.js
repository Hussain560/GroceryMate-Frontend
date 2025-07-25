import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5125/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config); // Debug log
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Transform the response data if it's wrapped in a data property
    if (response.data?.data !== undefined) {
      response.data = response.data.data;
    }
    console.log('API Response:', response); // Debug log
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
