import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getMyApplication = () => api.get('/partner/me');
export const applyPartner = (data) => api.post('/partner/apply', data);
export const reapplyPartner = (data) => api.post('/partner/reapply', data);
export const getDashboard = () => api.get('/partner/dashboard');

export const getAllApplications = () => api.get('/admin/applications');
export const getByStatus = (status) => api.get(`/admin/applications/status/${status}`);
export const getCounts = () => api.get('/admin/counts');
export const approveApplication = (id) => api.post(`/admin/approve/${id}`);
export const rejectApplication = (id, reason) => api.post(`/admin/reject/${id}`, { reason });
export const toggleCode = (id) => api.post(`/admin/code/toggle/${id}`);