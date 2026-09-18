import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useToggleUserStatus } from '../../hooks/useAdmin';
import { 
  ArrowLeft, 
  Users, 
  Lock, 
  Unlock, 
  Shield, 
  BookOpen, 
  GraduationCap,
  Search, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  Star, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUrl';

export const UserManagementPage = ({ onBack }) => {
  const navigate = useNavigate();
  const { showToast, confirm } = useToast();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'INSTRUCTOR', 'STUDENT', 'ADMIN'
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const { data: users = [], isLoading: loading, refetch } = useUsers();
  const toggleMutation = useToggleUserStatus();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/admin/dashboard');
  };

  const handleToggleActive = (userId, currentActive) => {
    const actionText = currentActive ? 'khóa' : 'mở khóa';
    confirm({
      title: `${currentActive ? 'Khóa' : 'Mở khóa'} tài khoản người dùng`,
      message: `Bạn có chắc chắn muốn ${actionText} quyền truy cập hệ thống của người dùng này?`,
      confirmText: currentActive ? 'Khóa tài khoản' : 'Mở khóa',
      isDanger: currentActive,
      onConfirm: async () => {
        setTogglingId(userId);
        try {
          await toggleMutation.mutateAsync(userId);
          showToast(`Đã ${actionText} tài khoản thành công!`, 'success');
        } catch (err) {
          console.error(`Lỗi khi ${actionText} tài khoản:`, err);
          showToast(err.response?.data?.message || `Lỗi khi ${actionText} tài khoản!`, 'error');
        } finally {
          setTogglingId(null);
        }
      },
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'INSTRUCTOR') return u.role === 'ROLE_INSTRUCTOR' || u.role === 'INSTRUCTOR';
    if (activeTab === 'STUDENT') return u.role === 'ROLE_STUDENT' || u.role === 'STUDENT';
    if (activeTab === 'ADMIN') return u.role === 'ROLE_ADMIN' || u.role === 'ADMIN';
    return true;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 bg-[#16324F] text-white text-[10px] font-bold rounded flex items-center gap-1">
            <Shield className="w-3 h-3" /> Admin Cấp cao
          </span>
        );
      case 'ROLE_INSTRUCTOR':
      case 'INSTRUCTOR':
        return (
          <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold rounded flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Giảng viên
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-[#FAF9FC] border border-[#E4E4E0] text-[#5E5E5E] text-[10px] font-bold rounded flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Học viên
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-10 px-6">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1.5 hover:bg-[#F4F3F6] rounded-md text-[#5E5E5E] cursor-pointer"
              title="Quay lại Tổng quan"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold font-serif text-[#001D37]">
                Quản lý Người dùng & Phân quyền Hệ thống
              </h1>
              <p className="text-xs text-[#5E5E5E]">
                Theo dõi, kích hoạt và quản lý trạng thái hoạt động của toàn bộ tài khoản học viên, giảng viên và quản trị viên
              </p>
            </div>
          </div>

          {/* Search Box & Reload */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-[#E4E4E0] rounded-lg px-3 py-1.5 w-64 focus-within:border-[#16324F]">
              <Search className="w-3.5 h-3.5 text-[#6B6B6B] mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, email, username..."
                className="w-full text-xs bg-transparent focus:outline-none text-[#1A1C1E]"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 border border-[#E4E4E0] bg-white hover:bg-[#FAF9FC] text-[#16324F] rounded-lg cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E4E0] pb-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#16324F] text-white shadow-xs'
                : 'text-[#5E5E5E] hover:bg-white hover:text-[#1A1C1E]'
            }`}
          >
            Tất cả ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('INSTRUCTOR')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'INSTRUCTOR'
                ? 'bg-[#16324F] text-white shadow-xs'
                : 'text-[#5E5E5E] hover:bg-white hover:text-[#1A1C1E]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Giảng viên ({users.filter((u) => u.role === 'ROLE_INSTRUCTOR' || u.role === 'INSTRUCTOR').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STUDENT'
                ? 'bg-[#16324F] text-white shadow-xs'
                : 'text-[#5E5E5E] hover:bg-white hover:text-[#1A1C1E]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Học viên ({users.filter((u) => u.role === 'ROLE_STUDENT' || u.role === 'STUDENT').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-[#16324F] text-white shadow-xs'
                : 'text-[#5E5E5E] hover:bg-white hover:text-[#1A1C1E]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Quản trị viên ({users.filter((u) => u.role === 'ROLE_ADMIN' || u.role === 'ADMIN').length})</span>
          </button>
        </div>

        {/* ACTIVE USERS TABLE */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9FC] border-b border-[#E4E4E0] text-[#5E5E5E] font-semibold">
                <th className="py-3.5 px-6">ID & Người dùng</th>
                <th className="py-3.5 px-6">Vai trò (Role)</th>
                <th className="py-3.5 px-6">Ngày tham gia</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E0]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#6B6B6B]">
                    Đang tải danh sách người dùng từ hệ thống...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#6B6B6B]">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF9FC] transition-colors">
                    {/* Name & Email */}
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <img
                        src={getImageUrl(u.avatarUrl, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')}
                        alt={u.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-[#E4E4E0] shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-[#1A1C1E]">
                          #{u.id} • {u.fullName}
                        </p>
                        <p className="text-[11px] text-[#5E5E5E]">{u.email}</p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-6">
                      {getRoleBadge(u.role)}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-6 text-[#5E5E5E]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mặc định hệ thống'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      {u.isActive !== false ? (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Hoạt động
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Đã khóa
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      {u.role !== 'ROLE_ADMIN' && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive !== false)}
                          disabled={togglingId === u.id}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer ${
                            u.isActive !== false
                              ? 'border border-[#BA1A1A]/30 text-[#BA1A1A] hover:bg-[#BA1A1A]/10'
                              : 'border border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10'
                          }`}
                        >
                          {u.isActive !== false ? (
                            <>
                              <Lock className="w-3 h-3" /> Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" /> Mở khóa
                            </>
                          )}
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
