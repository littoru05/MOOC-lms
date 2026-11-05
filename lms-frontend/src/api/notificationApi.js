import client from './client';

export const notificationApi = {
  getNotifications: ({ page = 0, size = 10, unreadOnly = false } = {}) =>
    client.get('/api/v1/notifications', {
      params: { page, size, unreadOnly },
    }),

  getUnreadCount: () =>
    client.get('/api/v1/notifications/unread-count'),

  markAsRead: (id) =>
    client.patch(`/api/v1/notifications/${id}/read`),

  markAllAsRead: () =>
    client.patch('/api/v1/notifications/read-all'),
};

export default notificationApi;

