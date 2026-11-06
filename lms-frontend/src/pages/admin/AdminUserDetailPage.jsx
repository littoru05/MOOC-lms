import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminUserDetail, useRevealSensitiveInfo, useResetUserPassword, useToggleUserActive } from '../../hooks/useAdmin';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Key, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Clock, 
  Award, 
  BookOpen, 
  ShoppingBag, 
  Calendar, 
  Phone, 
  Mail, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  FileText
} from 'lucide-react';

export const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: user, isLoading, isError, error, refetch } = useAdminUserDetail(id);
  const toggleActiveMutation = useToggleUserActive();
  const revealMutation = useRevealSensitiveInfo();
  const resetPasswordMutation = useResetUserPassword();

  // State thông tin nhạy cảm đã mở khóa (reveal)
  const [revealedInfo, setRevealedInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const countdownTimerRef = useRef(null);

  // Modal Xác thực xem thông tin nhạy cảm
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [revealAdminPassword, setRevealAdminPassword] = useState('');
  const [revealError, setRevealError] = useState('');

  // Modal Đặt lại mật khẩu (Nhập mật khẩu Admin)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetAdminPassword, setResetAdminPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // Modal Hiển thị Mật khẩu tạm thời (CHỈ MỘT LẦN)
  const [tempPasswordData, setTempPasswordData] = useState(null);
  const [copiedTempPassword, setCopiedTempPassword] = useState(false);

  // Quản lý đếm ngược 60 giây tự động che lại thông tin
  useEffect(() => {
    if (countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && revealedInfo) {
      setRevealedInfo(null);
      showToast('Đã hết thời gian hiển thị (60s). Thông tin nhạy cảm đã tự động được che lại.', 'info');
    }
    return () => clearTimeout(countdownTimerRef.current);
  }, [countdown, revealedInfo, showToast]);

  // Xử lý gửi mật khẩu Admin để mở khóa thông tin nhạy cảm
  const handleConfirmReveal = async (e) => {
    e.preventDefault();
    if (!revealAdminPassword.trim()) {
      setRevealError('Vui lòng nhập mật khẩu quản trị viên.');
      return;
    }

    const passwordToSend = revealAdminPassword;
    // Xóa mật khẩu khỏi state ngay sau khi lấy giá trị gửi đi
    setRevealAdminPassword('');
    setRevealError('');

    try {
      const data = await revealMutation.mutateAsync({
        userId: id,
        adminPassword: passwordToSend,
      });
      setRevealedInfo(data);
      setCountdown(60);
      setIsRevealModalOpen(false);
      showToast('Xác thực quản trị viên thành công! Thông tin nhạy cảm sẽ hiển thị trong 60 giây.', 'success');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Không thể xác thực mật khẩu quản trị viên.';
      if (status === 403) {
        setRevealError('Mật khẩu quản trị viên không chính xác. Vui lòng thử lại.');
      } else if (status === 429) {
        setRevealError(message || 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau 10 phút.');
      } else {
        setRevealError(message);
      }
    }
  };

  // Xử lý ẩn ngay thông tin nhạy cảm
  const handleHideNow = () => {
    setRevealedInfo(null);
    setCountdown(0);
    clearTimeout(countdownTimerRef.current);
    showToast('Đã ẩn thông tin nhạy cảm.', 'info');
  };

  // Xử lý gửi mật khẩu Admin để đặt lại mật khẩu tạm thời
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (!resetAdminPassword.trim()) {
      setResetError('Vui lòng nhập mật khẩu quản trị viên.');
      return;
    }

    const passwordToSend = resetAdminPassword;
    setResetAdminPassword('');
    setResetError('');

    try {
      const data = await resetPasswordMutation.mutateAsync({
        userId: id,
        adminPassword: passwordToSend,
      });
      setIsResetModalOpen(false);
      setTempPasswordData(data.tempPassword);
      setCopiedTempPassword(false);
      showToast('Đã tạo mật khẩu tạm thời thành công.', 'success');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu người dùng.';
      if (status === 403) {
        setResetError('Mật khẩu quản trị viên không chính xác. Vui lòng thử lại.');
      } else if (status === 429) {
        setResetError(message || 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau 10 phút.');
      } else {
        setResetError(message);
      }
    }
  };

  // Khóa / Mở khóa tài khoản người dùng
  const handleToggleActive = async () => {
    try {
      await toggleActiveMutation.mutateAsync(id);
      await refetch();
      showToast(
        user.isActive ? 'Đã khóa tài khoản thành công.' : 'Đã kích hoạt mở khóa tài khoản thành công.',
        'success'
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái tài khoản.', 'error');
    }
  };

  // Sao chép mật khẩu tạm thời
  const handleCopyTempPassword = () => {
    if (tempPasswordData) {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(tempPasswordData);
      }
      setCopiedTempPassword(true);
      setTimeout(() => setCopiedTempPassword(false), 2000);
      showToast('Đã sao chép mật khẩu tạm thời vào bộ nhớ tạm!', 'success');
    }
  };

  // Đóng modal mật khẩu tạm -> Xóa khỏi bộ nhớ
  const handleCloseTempPasswordModal = () => {
    setTempPasswordData(null);
    setCopiedTempPassword(false);
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-[#5E5E5E]">
        Đang nạp chi tiết hồ sơ tài khoản từ máy chủ...
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-bold text-red-600">
          {error?.response?.data?.message || 'Không tìm thấy người dùng này hoặc bạn không có quyền truy cập.'}
        </p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-[#001D37] text-white text-xs font-semibold rounded-xl"
        >
          Quay lại danh sách người dùng
        </button>
      </div>
    );
  }

  const isStudent = user.role === 'ROLE_STUDENT' || user.role === 'STUDENT';
  const isInstructor = user.role === 'ROLE_INSTRUCTOR' || user.role === 'INSTRUCTOR';
  const isAdmin = user.role === 'ROLE_ADMIN' || user.role === 'ADMIN';

  // Dữ liệu nhạy cảm hiển thị (nếu đã mở khóa thì dùng unmasked, ngược lại dùng masked)
  const displayEmail = revealedInfo ? revealedInfo.email : user.email;
  const displayPhone = revealedInfo ? (revealedInfo.phone || 'Chưa cập nhật') : (user.phone || 'Chưa cập nhật');
  const displayDob = revealedInfo 
    ? (revealedInfo.dateOfBirth ? new Date(revealedInfo.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật') 
    : (user.dateOfBirth || 'Chưa cập nhật');
  const displayGender = revealedInfo ? (revealedInfo.gender || 'Chưa cập nhật') : (user.gender || 'Chưa cập nhật');

  return (
    <div className="py-8 px-6 max-w-[1280px] mx-auto space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-[#5E5E5E] cursor-pointer transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-serif text-[#001D37]">
                Chi tiết Tài khoản Người dùng
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                isInstructor ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {isAdmin ? 'Quản trị viên' : isInstructor ? 'Giảng viên' : 'Học viên'}
              </span>
            </div>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Mã định danh hệ thống: <span className="font-mono font-bold text-[#001D37]">#{user.id}</span> • Ngày đăng ký: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}
            </p>
          </div>
        </div>

        {/* Nút Khóa / Mở khóa tài khoản */}
        {!isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 ${
                user.isActive
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {user.isActive ? (
                <>
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>Khóa tài khoản này</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-white" />
                  <span>Kích hoạt mở khóa tài khoản</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Basic Profile Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <img
                src={getImageUrl(user.avatarUrl, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200')}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md mx-auto"
              />
              <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                user.isActive ? 'bg-emerald-500' : 'bg-red-500'
              }`} title={user.isActive ? 'Đang hoạt động' : 'Tài khoản đã bị khóa'}>
                {user.isActive ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold font-serif text-[#001D37]">
                {user.fullName}
              </h2>
              <p className="text-xs text-[#5E5E5E] font-mono">@{user.username || 'username_mac_dinh'}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF9FC] border border-[#E4E4E0]">
              <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-[#001D37]">{user.isActive ? 'Tài khoản hoạt động' : 'Tài khoản đang bị khóa'}</span>
            </div>
          </div>

          <div className="border-t border-[#E4E4E0] pt-4 space-y-3 text-xs">
            {user.title && (
              <div>
                <span className="text-[#5E5E5E] text-[11px] block">Chức danh / Học vị:</span>
                <span className="font-semibold text-[#001D37]">{user.title}</span>
              </div>
            )}
            {user.teachingField && (
              <div>
                <span className="text-[#5E5E5E] text-[11px] block">Lĩnh vực chuyên môn:</span>
                <span className="font-semibold text-[#001D37]">{user.teachingField}</span>
              </div>
            )}
            {user.bio && (
              <div>
                <span className="text-[#5E5E5E] text-[11px] block">Tiểu sử tóm tắt:</span>
                <p className="text-[#5E5E5E] leading-relaxed mt-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  {user.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Sensitive Info, Security, & Stats (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card: Thông tin Nhạy cảm & Bảo mật */}
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E4E0] pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#001D37]" />
                <h3 className="font-serif font-bold text-base text-[#001D37]">
                  Thông tin Nhạy cảm & Xác thực Quản trị
                </h3>
              </div>

              {revealedInfo ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tự động ẩn sau: <strong>{countdown}s</strong></span>
                  </span>
                  <button
                    onClick={handleHideNow}
                    className="px-3 py-1 text-xs font-semibold text-[#5E5E5E] hover:text-[#001D37] hover:bg-gray-100 rounded-lg border border-[#E4E4E0] transition-colors cursor-pointer"
                  >
                    Ẩn ngay
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsRevealModalOpen(true);
                    setRevealError('');
                  }}
                  className="px-3.5 py-1.5 bg-[#001D37] hover:bg-[#16324F] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem thông tin đầy đủ</span>
                </button>
              )}
            </div>

            {/* Sensitive Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E5E5E] uppercase">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Địa chỉ Email</span>
                </div>
                <p className="font-mono font-bold text-sm text-[#001D37] break-all">
                  {displayEmail}
                </p>
              </div>

              <div className="p-3.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E5E5E] uppercase">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Số điện thoại</span>
                </div>
                <p className="font-mono font-bold text-sm text-[#001D37]">
                  {displayPhone}
                </p>
              </div>

              <div className="p-3.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E5E5E] uppercase">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ngày sinh</span>
                </div>
                <p className="font-semibold text-sm text-[#001D37]">
                  {displayDob}
                </p>
              </div>

              <div className="p-3.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E5E5E] uppercase">
                  <User className="w-3.5 h-3.5" />
                  <span>Giới tính</span>
                </div>
                <p className="font-semibold text-sm text-[#001D37]">
                  {displayGender}
                </p>
              </div>
            </div>

            {/* Password Management Row */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-xs text-[#001D37]">Mật khẩu đăng nhập:</span>
                  <span className="font-mono tracking-widest text-[#001D37] font-bold">••••••••</span>
                </div>
                <p className="text-[11px] text-[#5E5E5E]">
                  Mật khẩu được mã hóa một chiều an toàn bằng BCrypt nên không thể xem lại.
                </p>
              </div>

              {!isAdmin ? (
                <button
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setResetError('');
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  Đặt lại mật khẩu
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-gray-500 italic">
                  Không thể đặt lại mật khẩu Quản trị viên
                </span>
              )}
            </div>
          </div>

          {/* Card: Thống kê hoạt động (Stats) */}
          {user.stats && (
            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E4E4E0] pb-3">
                <TrendingUp className="w-5 h-5 text-[#001D37]" />
                <h3 className="font-serif font-bold text-base text-[#001D37]">
                  {isStudent ? 'Số liệu Học tập & Giao dịch' : isInstructor ? 'Số liệu Giảng dạy & Khóa học' : 'Thống kê Quản trị'}
                </h3>
              </div>

              {isStudent && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-center">
                    <span className="text-[10px] font-bold text-[#5E5E5E] uppercase block">Đang học</span>
                    <span className="text-xl font-extrabold text-[#001D37] font-serif">{user.stats.enrolledCoursesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Hoàn thành</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-serif">{user.stats.completedCoursesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Chứng chỉ</span>
                    <span className="text-xl font-extrabold text-blue-700 font-serif">{user.stats.certificatesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-center">
                    <span className="text-[10px] font-bold text-[#5E5E5E] uppercase block">Đơn hàng</span>
                    <span className="text-xl font-extrabold text-[#001D37] font-serif">{user.stats.ordersCount || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Tổng chi</span>
                    <span className="text-sm font-extrabold text-amber-800 font-serif block mt-1">
                      {formatCurrency(user.stats.totalSpent || 0)}
                    </span>
                  </div>
                </div>
              )}

              {isInstructor && (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-center">
                    <span className="text-[10px] font-bold text-[#5E5E5E] uppercase block">Tổng khóa</span>
                    <span className="text-xl font-extrabold text-[#001D37] font-serif">{user.stats.totalCoursesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Đã xuất bản</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-serif">{user.stats.publishedCoursesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Chờ duyệt</span>
                    <span className="text-xl font-extrabold text-amber-700 font-serif">{user.stats.pendingCoursesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-gray-700 uppercase block">Bản nháp</span>
                    <span className="text-xl font-extrabold text-gray-700 font-serif">{user.stats.draftCoursesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-700 uppercase block">Lưu trữ</span>
                    <span className="text-xl font-extrabold text-slate-700 font-serif">{user.stats.archivedCoursesCount || 0}</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Học viên</span>
                    <span className="text-xl font-extrabold text-blue-700 font-serif">{user.stats.totalStudentsCount || 0}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Recent Activity Sections (5 Rows per section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Box 1: Khóa học đã đăng ký gần nhất */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#001D37]" />
              <h4 className="font-serif font-bold text-sm text-[#001D37]">
                Khóa học đăng ký ({user.recentEnrollments?.length || 0})
              </h4>
            </div>
          </div>

          {(!user.recentEnrollments || user.recentEnrollments.length === 0) ? (
            <p className="text-xs text-[#5E5E5E] py-6 text-center italic">Chưa ghi danh khóa học nào.</p>
          ) : (
            <div className="divide-y divide-[#E4E4E0] text-xs">
              {user.recentEnrollments.map((item) => (
                <div key={item.enrollmentId} className="py-2.5 space-y-1">
                  <p className="font-semibold text-[#001D37] line-clamp-1" title={item.courseTitle}>
                    {item.courseTitle}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#5E5E5E]">
                    <span>Tiến độ: <strong>{item.progressPercent || 0}%</strong></span>
                    <span>{item.isCompleted ? (
                      <span className="text-emerald-600 font-bold">Hoàn thành</span>
                    ) : (
                      <span className="text-blue-600">Đang học</span>
                    )}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Box 2: Đơn hàng gần nhất */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-2.5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#001D37]" />
              <h4 className="font-serif font-bold text-sm text-[#001D37]">
                Đơn hàng gần đây ({user.recentOrders?.length || 0})
              </h4>
            </div>
          </div>

          {(!user.recentOrders || user.recentOrders.length === 0) ? (
            <p className="text-xs text-[#5E5E5E] py-6 text-center italic">Chưa phát sinh đơn hàng nào.</p>
          ) : (
            <div className="divide-y divide-[#E4E4E0] text-xs">
              {user.recentOrders.map((ord) => (
                <div key={ord.orderId} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#001D37]">{ord.orderCode}</span>
                    <span className="font-bold text-[#001D37]">{formatCurrency(ord.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5E5E5E]">
                    <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                    <span className={ord.status === 'COMPLETED' ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {ord.status === 'COMPLETED' ? 'Thành công' : ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Box 3: Chứng chỉ số gần nhất (hoặc Khóa học tạo nếu là Giảng viên) */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-2.5">
            <div className="flex items-center gap-2">
              {isInstructor ? <FileText className="w-4 h-4 text-[#001D37]" /> : <Award className="w-4 h-4 text-[#001D37]" />}
              <h4 className="font-serif font-bold text-sm text-[#001D37]">
                {isInstructor ? `Khóa học đã tạo (${user.recentCourses?.length || 0})` : `Chứng chỉ số (${user.recentCertificates?.length || 0})`}
              </h4>
            </div>
          </div>

          {isInstructor ? (
            (!user.recentCourses || user.recentCourses.length === 0) ? (
              <p className="text-xs text-[#5E5E5E] py-6 text-center italic">Chưa tạo khóa học nào.</p>
            ) : (
              <div className="divide-y divide-[#E4E4E0] text-xs">
                {user.recentCourses.map((c) => (
                  <div key={c.courseId} className="py-2.5 space-y-1">
                    <p className="font-semibold text-[#001D37] line-clamp-1">{c.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#5E5E5E]">
                      <span>{c.enrolledCount} học viên</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(c.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            (!user.recentCertificates || user.recentCertificates.length === 0) ? (
              <p className="text-xs text-[#5E5E5E] py-6 text-center italic">Chưa có chứng chỉ tốt nghiệp.</p>
            ) : (
              <div className="divide-y divide-[#E4E4E0] text-xs">
                {user.recentCertificates.map((cert) => (
                  <div key={cert.certificateId} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#001D37] truncate max-w-[140px]">{cert.certificateCode}</span>
                      <span className="font-bold text-amber-600">{cert.finalScore ? `${cert.finalScore}%` : 'Đạt'}</span>
                    </div>
                    <p className="text-[11px] text-[#5E5E5E] truncate">{cert.courseTitle}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>

      {/* MODAL 1: Xác thực mật khẩu Admin để xem thông tin nhạy cảm */}
      {isRevealModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-[#001D37]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#001D37]">
                    Xác thực Quản trị viên
                  </h3>
                  <p className="text-[11px] text-[#5E5E5E]">
                    Truy xuất dữ liệu nhạy cảm được bảo vệ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRevealModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5E5E5E] leading-relaxed">
              Vui lòng nhập mật khẩu Quản trị viên của bạn để xác thực quyền truy cập dữ liệu nhạy cảm (Email, SĐT, Ngày sinh). Thao tác này sẽ được ghi vào nhật ký kiểm toán hệ thống.
            </p>

            {revealError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{revealError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReveal} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#001D37] mb-1.5">
                  Mật khẩu Quản trị viên của bạn:
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={revealAdminPassword}
                  onChange={(e) => setRevealAdminPassword(e.target.value)}
                  placeholder="Nhập mật khẩu admin..."
                  className="w-full px-3.5 py-2 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRevealModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={revealMutation.isPending}
                  className="px-4 py-2 bg-[#001D37] hover:bg-[#16324F] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {revealMutation.isPending ? 'Đang xác thực...' : 'Xác thực & Hiển thị'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Xác thực mật khẩu Admin để đặt lại mật khẩu */}
      {isResetModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-amber-700">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#001D37]">
                    Đặt lại Mật khẩu Người dùng
                  </h3>
                  <p className="text-[11px] text-[#5E5E5E]">
                    Tạo mật khẩu tạm thời 12 ký tự ngẫu nhiên
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Lưu ý quan trọng:</p>
              <p>Mật khẩu tạm thời sẽ được sinh ngẫu nhiên và chỉ hiển thị một lần. Tất cả các phiên đăng nhập hiện tại của người dùng này sẽ bị thu hồi ngay lập tức.</p>
            </div>

            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#001D37] mb-1.5">
                  Xác nhận bằng Mật khẩu Quản trị viên của bạn:
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={resetAdminPassword}
                  onChange={(e) => setResetAdminPassword(e.target.value)}
                  placeholder="Nhập mật khẩu admin..."
                  className="w-full px-3.5 py-2 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-amber-600 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {resetPasswordMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Đặt lại mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: Hiển thị Mật khẩu tạm thời duy nhất 1 lần */}
      {tempPasswordData && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 text-emerald-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#001D37]">
                  Mật khẩu Tạm thời Mới
                </h3>
                <p className="text-[11px] text-[#5E5E5E]">
                  Đã cập nhật mật khẩu cho {user.fullName}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>CẢNH BÁO: CHỈ HIỂN THỊ MỘT LẦN DUY NHẤT!</span>
              </div>
              <p>Mật khẩu này không được lưu ở dạng văn bản thô trên hệ thống. Hãy sao chép ngay và gửi cho người dùng, đồng thời yêu cầu họ đổi mật khẩu sau khi đăng nhập.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3">
              <span className="font-mono text-base font-extrabold text-[#001D37] tracking-wider select-all">
                {tempPasswordData}
              </span>
              <button
                type="button"
                onClick={handleCopyTempPassword}
                className="px-3 py-1.5 bg-[#001D37] hover:bg-[#16324F] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                {copiedTempPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTempPassword ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCloseTempPasswordModal}
                className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tôi đã lưu mật khẩu & Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminUserDetailPage;
