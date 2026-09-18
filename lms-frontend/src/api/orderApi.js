import client from './client';

export const orderApi = {
  checkout: () => client.post('/api/v1/orders/checkout'),
  getMyOrders: () => client.get('/api/v1/orders'),
  getOrderById: (id) => client.get(`/api/v1/orders/${id}`),
};
