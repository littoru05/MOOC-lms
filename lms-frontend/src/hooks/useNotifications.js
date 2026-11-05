import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';

/**
 * Normalizes notification item to ensure both isRead and read booleans exist.
 */
export const normalizeNotification = (n) => {
  if (!n) return n;
  const isRead = Boolean(n.isRead ?? n.read);
  return {
    ...n,
    isRead,
    read: isRead,
  };
};

/**
 * Hook to fetch paginated notifications
 */
export const useNotifications = ({ page = 0, size = 10, unreadOnly = false, enabled = true } = {}) => {
  return useQuery({
    queryKey: ['notifications', { page, size, unreadOnly }],
    queryFn: async () => {
      const response = await notificationApi.getNotifications({ page, size, unreadOnly });
      const data = response.data || {};
      if (data.content && Array.isArray(data.content)) {
        data.content = data.content.map(normalizeNotification);
      }
      return data;
    },
    enabled,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
};

/**
 * Hook for recent notifications in the dropdown (size = 8)
 */
export const useRecentNotifications = (enabled = true) => {
  return useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      const response = await notificationApi.getNotifications({ page: 0, size: 8, unreadOnly: false });
      const content = response.data?.content || [];
      return content.map(normalizeNotification);
    },
    enabled,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
};

/**
 * Hook to poll unread count every 30 seconds when tab is active
 */
export const useUnreadNotificationCount = (enabled = true) => {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await notificationApi.getUnreadCount();
      return response.data?.unreadCount ?? response.data?.count ?? 0;
    },
    enabled,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
};

/**
 * Mutation to mark a single notification as read with optimistic updates
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onMutate: async (id) => {
      // Optimistically update recent dropdown notifications
      queryClient.setQueryData(['notifications', 'recent'], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n));
      });

      // Optimistically update paginated queries
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n));
        }
        if (old.content && Array.isArray(old.content)) {
          return {
            ...old,
            content: old.content.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)),
            unreadCount: Math.max(0, (old.unreadCount || 1) - 1),
          };
        }
        return old;
      });

      // Optimistically update unread count
      queryClient.setQueryData(['notifications-unread-count'], (old) => {
        if (typeof old === 'number') return Math.max(0, old - 1);
        if (old && typeof old === 'object') {
          const current = old.unreadCount ?? old.count ?? 0;
          const next = Math.max(0, current - 1);
          return { ...old, unreadCount: next, count: next };
        }
        return 0;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};

/**
 * Mutation to mark all notifications as read with optimistic updates
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      queryClient.setQueryData(['notifications', 'recent'], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((n) => ({ ...n, isRead: true, read: true }));
      });

      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map((n) => ({ ...n, isRead: true, read: true }));
        }
        if (old.content && Array.isArray(old.content)) {
          return {
            ...old,
            content: old.content.map((n) => ({ ...n, isRead: true, read: true })),
            unreadCount: 0,
          };
        }
        return old;
      });

      queryClient.setQueryData(['notifications-unread-count'], 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};
