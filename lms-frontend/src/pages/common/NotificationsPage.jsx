import React, { useState } from 'react';
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
  Filter,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead 
} from '../../hooks/useNotifications';
import { Pagination } from '../../components/common/Pagination';
import { formatTimeAgo } from '../../utils/format';

const PAGE_SIZE = 10;

export const NotificationsPage = ({ portal = 'instructor' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' || portal === 'admin';

  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Server-side pagination is 0-indexed in Spring Boot
  const { data, isLoading } = useNotifications({
    page: currentPage - 1,
    size: PAGE_SIZE,
    unreadOnly: filterUnreadOnly,
    enabled: !!user,
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const unreadCount = data?.unreadCount || 0;

  const handleFilterChange = (unreadOnly) => {
    setFilterUnreadOnly(unreadOnly);
    setCurrentPage(1);
  };

  const isNotificationRead = (notif) => {
    return notif?.isRead === true || notif?.read === true;
  };

  const handleNotificationClick = async (notif) => {
    if (!isNotificationRead(notif)) {
      markAsReadMutation.mutate(notif.id);
    }

    if (isAdmin) {
      if (notif.type === 'COURSE_SUBMITTED' || notif.type === 'COURSE_DELETE_REQUESTED') {
        navigate(`/admin/courses/approval?courseId=${notif.courseId}`);
        return;
      }
      if (notif.type === 'CERTIFICATE_ISSUED') {
        navigate(notif.link || '/admin/certificates');
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

  const getIcon = (type) => {
    switch (type) {
      case 'COURSE_SUBMITTED':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'COURSE_DELETE_REQUESTED':
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'LESSON_ADDED':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'COURSE_APPROVED':
      case 'COURSE_DELETE_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'COURSE_REJECTED':
      case 'COURSE_DELETE_REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CERTIFICATE_ISSUED':
        return <Award className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="py-10 px-8 space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold  text-[#001D37]">
            Trung tâm thông báo
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-1">
            Cập nhật hoạt động kiểm duyệt, xuất bản khóa học và tiến trình nội dung của hệ thống
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="px-3.5 py-2 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#001D37] text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50 shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Đánh dấu đã đọc tất cả ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleFilterChange(false)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            !filterUnreadOnly
              ? 'bg-[#16324F] text-white shadow-xs'
              : 'bg-white border border-[#E4E4E0] text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
          }`}
        >
          Tất cả thông báo
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange(true)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterUnreadOnly
              ? 'bg-[#16324F] text-white shadow-xs'
              : 'bg-white border border-[#E4E4E0] text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
          }`}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterUnreadOnly ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700 font-bold'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-xs text-[#5E5E5E]">
            Đang tải dữ liệu thông báo...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-24 text-center space-y-2">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className=" font-bold text-base text-[#1A1C1E]">
              {filterUnreadOnly ? 'Không có thông báo chưa đọc nào' : 'Bạn chưa có thông báo nào'}
            </p>
            <p className="text-xs text-[#5E5E5E]">
              {filterUnreadOnly
                ? 'Tất cả thông báo đều đã được đọc.'
                : 'Mọi thông báo cập nhật phê duyệt hoặc nội dung sẽ xuất hiện ở đây.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E0]">
            {notifications.map((notif) => {
              const isUnread = !isNotificationRead(notif);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-[#F8F7FA] ${
                    isUnread ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                >
                  <div className="shrink-0 mt-0.5 p-2.5 rounded-xl bg-gray-100/80">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm ${isUnread ? 'font-bold text-[#001D37]' : 'font-semibold text-[#1A1C1E]'}`}>
                          {notif.title}
                        </h3>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5E5E] mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Server-Side Pagination */}
        {totalElements > PAGE_SIZE && (
          <div className="p-4 border-t border-[#E4E4E0] bg-[#FAF9FC]">
            <Pagination
              currentPage={currentPage}
              totalItems={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
