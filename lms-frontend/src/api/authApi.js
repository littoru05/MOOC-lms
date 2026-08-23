import client from './client';

export const authApi = {
  login: (data) => client.post('/api/v1/auth/login', data),
  register: (data) => client.post('/api/v1/auth/register', data),
  getMe: () => client.get('/api/v1/auth/me'),
  updateProfile: (data) => client.put('/api/v1/auth/profile', data),
  changePassword: (data) => client.put('/api/v1/auth/change-password', data),
};
