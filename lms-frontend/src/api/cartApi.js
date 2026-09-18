import client from './client';

export const cartApi = {
  getCart: () => client.get('/api/v1/cart'),
  addToCart: (courseId) => client.post('/api/v1/cart/items', { courseId }),
  removeFromCart: (courseId) => client.delete(`/api/v1/cart/items/${courseId}`),
  checkout: (data) => client.post('/api/v1/orders/checkout', data),
};

