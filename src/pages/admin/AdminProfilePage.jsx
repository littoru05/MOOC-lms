import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Save, 
  KeyRound, 
  ShieldAlert, 
  Activity, 
  Clock, 
  Server, 
  CheckCircle2,
  Terminal,
  Database
} from 'lucide-react';

export const AdminProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Admin Info
  const [fullName, setFullName] = useState(user?.fullName || 'Quản trị viên Hệ thống');
  const [email] = useState(user?.email || 'admin@lms.com');
  const [phone, setPhone] = useState('0900112233');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  );
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [avatarInputVal, setAvatarInputVal] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      showToast('Họ và tên phải có ít nhất 2 ký tự!', 'warning');
      return;
    }
    if (phone && !/^[0-9]{9,11}$/.test(phone.replace(/\s+/g, ''))) {
      showToast('Số điện thoại không đúng định dạng (9-11 chữ số)!', 'warning');
      return;
    }

    setSavingInfo(true);
    setTimeout(() => {
      setSavingInfo(false);
      showToast('Đã cập nhật thông tin Quản trị viên thành công!', 'success');
    }, 400);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('Vui lòng nhập mật khẩu quản trị hiện tại!', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 ký tự!', 'warning');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Mật khẩu xác nhận không khớp với mật khẩu mới!', 'warning');
      return;
    }

    setSavingPass(true);
    setTimeout(() => {
      setSavingPass(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Đã cập nhật mật khẩu quản trị an toàn!', 'success');
    }, 500);
  };

  const handleUpdateAvatar = () => {
    if (avatarInputVal.trim()) {
      setAvatarUrl(avatarInputVal.trim());
      setShowAvatarInput(false);
      setAvatarInputVal('');
      showToast('Đã cập nhật ảnh đại diện quản trị!', 'success');
    }
  };

  return (
    <div className="py-10 px-8 space-y-8 max-w-5xl">
      
      {/* Top Header */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#001D37] uppercase tracking-wider">Hệ thống Kiểm toán</span>
          <h1 className="text-2xl font-bold font-serif text-[#001D37] mt-1">
            Hồ sơ Quản trị viên Cấp cao
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Quản lý tài khoản quản trị hệ thống, nhật ký phiên làm việc và bảo mật xác thực
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-[#001D37] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-blue-300" /> ROOT_ADMINISTRATOR
        </span>
      </div>

      {/* Top Profile Card */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-24 h-24 rounded-full object-cover border-2 border-[#001D37] shadow-sm"
          />
          <button
            onClick={() => setShowAvatarInput(!showAvatarInput)}
            className="absolute bottom-0 right-0 p-2 bg-[#001D37] hover:bg-[#16324F] text-white rounded-full shadow-md transition-colors"
            title="Đổi ảnh đại diện"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold font-serif text-[#001D37]">{fullName}</h2>
          <p className="text-xs font-medium text-[#16324F]">{email}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 rounded-md font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Trạng thái: Active (Toàn quyền)
            </span>
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-[11px] text-blue-800 rounded-md font-semibold flex items-center gap-1">
              <Database className="w-3 h-3" /> MySQL 8.0 SuperAdmin
            </span>
          </div>

          {showAvatarInput && (
            <div className="mt-3 flex items-center gap-2 max-w-md pt-2">
              <input
                type="url"
                value={avatarInputVal}
                onChange={(e) => setAvatarInputVal(e.target.value)}
                placeholder="Dán link ảnh đại diện (https://...)"
                className="flex-1 px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#001D37] bg-white"
              />
              <button
                onClick={handleUpdateAvatar}
                className="px-3 py-1.5 bg-[#001D37] text-white text-xs font-semibold rounded-lg"
              >
                Lưu ảnh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* System & Session Audit Info */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-base text-[#001D37] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#001D37]" />
          <span>Thông tin phiên làm việc & Đặc quyền (System Audit)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5E5E5E]">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Đăng nhập gần nhất:</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#001D37] pt-1">22/08/2026 • 15:10</p>
            <p className="text-[11px] text-[#5E5E5E]">IP: 127.0.0.1 (Docker Bridge)</p>
          </div>

          <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5E5E5E]">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Vai trò hệ thống:</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#001D37] pt-1">ROLE_ADMIN</p>
            <p className="text-[11px] text-[#5E5E5E]">Đặc quyền: Duyệt khóa học & Quản lý User</p>
          </div>

          <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5E5E5E]">
              <Server className="w-4 h-4 text-purple-600" />
              <span>Ngày khởi tạo:</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#001D37] pt-1">01/01/2026</p>
            <p className="text-[11px] text-[#5E5E5E]">Khởi tạo qua DataInitializer</p>
          </div>
        </div>
      </div>

      {/* Section 1: Admin Personal Info */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
            <User className="w-5 h-5 text-[#001D37]" />
            <span>Thông tin cá nhân Quản trị viên</span>
          </h3>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Thông tin liên hệ trực tiếp khi có sự cố hạ tầng hoặc thông báo kiểm định hệ thống
          </p>
        </div>

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Họ và tên */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1A1C1E]">
                Họ và tên <span className="text-[#BA1A1A]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Quản trị viên Hệ thống"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] bg-white"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1A1C1E]">
                Địa chỉ Email <span className="text-[10px] text-[#5E5E5E] font-normal">(Cố định không sửa)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl bg-[#FAF9FC] text-[#6B6B6B] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1A1C1E]">
                Số điện thoại liên hệ khẩn cấp
              </label>
              <div className="relative max-w-md">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0900112233"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] bg-white"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-[#E4E4E0]">
            <button
              type="submit"
              disabled={savingInfo}
              className="px-6 py-2.5 bg-[#001D37] hover:bg-[#16324F] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingInfo ? 'Đang lưu...' : 'Lưu thông tin quản trị'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Password Change Form */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#001D37]" />
            <span>Đổi mật khẩu Quản trị viên</span>
          </h3>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Tài khoản Quản trị viên nắm giữ toàn quyền hệ thống, hãy đảm bảo mật khẩu có độ phức tạp cao
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1A1C1E]">
              Mật khẩu hiện tại <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu admin hiện tại"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1A1C1E]">
              Mật khẩu mới <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1A1C1E]">
              Xác nhận mật khẩu mới <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPass}
              className="px-6 py-2.5 bg-[#001D37] hover:bg-[#16324F] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{savingPass ? 'Đang xử lý...' : 'Cập nhật mật khẩu quản trị'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
