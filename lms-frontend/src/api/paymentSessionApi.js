import client from './client';

export const paymentSessionApi = {
  createSession: () => client.post('/api/v1/payment-sessions'),
  getSessionStatus: (token) => client.get(`/api/v1/payment-sessions/${token}/status`),
  confirmSession: (token) => client.post(`/api/v1/payment-sessions/${token}/confirm`),
};
