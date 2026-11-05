import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  BookOpen, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  useUnreadNotificationCount, 
  useRecentNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead 
} from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/format';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const allNotificationsPath = isAdmin ? '/admin/notifications' : '/instructor/notifications';

  const { data: unreadCount = 0 } = useUnreadNotificationCount(!!user);
  const { data: recentNotifications = [], isLoading } = useRecentNotifications(!!user);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isNotificationRead = (notif) => {
    return notif?.isRead === true || notif?.read === true;
  };

  const handleNotificationClick = async (notif) => {
    if (!isNotificationRead(notif)) {
      markAsReadMutation.mutate(notif.id);
    }
    setIsOpen(false);

    if (isAdmin) {
      if (notif.type === 'COURSE_SUBMITTED' || notif.type === 'COURSE_DELETE_REQUESTED') {
        navigate(`/admin/courses/approval?courseId=${notif.courseId}`);
        return;
      }
      if (notif.type === 'LESSON_ADDED') {
        if (notif.link) {
          navigate(notif.link);
        }
        return;
      }
      if (notif.link) {
        navigate(notif.link);
      }
    } else {
      // Giảng viên
      if (notif.courseId) {
        navigate(`/instructor/courses/editor?courseId=${notif.courseId}`);
      } else if (notif.link) {
        navigate(notif.link);
      }
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllAsReadMutation.mutate();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'COURSE_SUBMITTED':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'COURSE_DELETE_REQUESTED':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'LESSON_ADDED':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'COURSE_APPROVED':
      case 'COURSE_DELETE_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'COURSE_REJECTED':
      case 'COURSE_DELETE_REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        aria-label="Thông báo"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-[#5E5E5E] hover:text-[#001D37] hover:bg-[#F2F1F4] transition-colors cursor-pointer"
      >
        <div className="relative flex items-center justify-center">
          <Bell className="w-5 h-5 text-current" />
          {unreadCount > 0 && (
            <span 
              data-testid="notification-badge"
              className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white leading-none shadow-xs pointer-events-none"
            >
              {displayCount}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          data-testid="notification-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4E4E0] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#FAF9FC] border-b border-[#E4E4E0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#001D37]">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-[11px] font-medium text-[#16324F] hover:text-blue-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đánh dấu đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E4E4E0]">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#5E5E5E]">
                Đang tải thông báo...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5E5E5E] space-y-1">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-[#1A1C1E]">Chưa có thông báo nào</p>
                <p className="text-[11px] text-gray-400">Các cập nhật quan trọng sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const isUnread = !isNotificationRead(notif);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-[#F2F1F4] ${
                      isUnread ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-gray-100">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${isUnread ? 'font-bold text-[#001D37]' : 'font-medium text-[#1A1C1E]'}`}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#5E5E5E] line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FAF9FC] border-t border-[#E4E4E0] text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(allNotificationsPath);
              }}
              className="w-full py-1 text-xs font-semibold text-[#16324F] hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
