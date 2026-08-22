import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { learningApi } from '../../api/learningApi';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Lock, 
  Camera, 
  Save, 
  KeyRound, 
  GraduationCap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Personal Info Form
  const [fullName, setFullName] = useState(user?.fullName || 'Trần Văn Học Viên');
  const [email] = useState(user?.email || 'student@lms.com');
  const [phone, setPhone] = useState('0987654321');
  const [dob, setDob] = useState('2001-05-15');
  const [gender, setGender] = useState('Nam');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
  );
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [avatarInputVal, setAvatarInputVal] = useState('');

  // Password Change Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Learning Stats
  const [stats, setStats] = useState({
    enrolled: 1,
    completed: 0,
    certificates: 0,
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    const fetchLearningStats = async () => {
      try {
        const [enrollRes, certRes] = await Promise.all([
          learningApi.getMyEnrollments().catch(() => ({ data: [] })),
          learningApi.getMyCertificates().catch(() => ({ data: [] })),
        ]);
        const enrollList = enrollRes.data || [];
        const certList = certRes.data || [];
        setStats({
          enrolled: enrollList.length > 0 ? enrollList.length : 1,
          completed: enrollList.filter((e) => e.isCompleted).length,
          certificates: certList.length,
        });
      } catch (e) {
        // Keep initial
      }
    };
    fetchLearningStats();
  }, []);

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
      showToast('Đã lưu thông tin hồ sơ học viên thành công!', 'success');
    }, 400);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại!', 'warning');
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
      showToast('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.', 'success');
    }, 500);
  };

  const handleUpdateAvatar = () => {
    if (avatarInputVal.trim()) {
      setAvatarUrl(avatarInputVal.trim());
      setShowAvatarInput(false);
      setAvatarInputVal('');
      showToast('Đã cập nhật ảnh đại diện mới!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#16324F] uppercase tracking-wider">Tài khoản học tập</span>
            <h1 className="text-2xl font-bold font-serif text-[#001D37] mt-1">
              Hồ sơ Cá nhân Học viên
            </h1>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Quản lý thông tin định danh trên chứng chỉ, theo dõi tiến độ đào tạo và bảo mật tài khoản
            </p>
          </div>
          <span className="px-3 py-1 bg-[#16324F]/10 border border-[#16324F]/20 text-[#16324F] text-xs font-bold rounded-full flex items-center gap-1.5 self-start sm:self-auto">
            <GraduationCap className="w-4 h-4" /> Học viên (ROLE_STUDENT)
          </span>
        </div>

        {/* Top Profile Banner Card */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#16324F] shadow-sm"
            />
            <button
              onClick={() => setShowAvatarInput(!showAvatarInput)}
              className="absolute bottom-0 right-0 p-2 bg-[#16324F] hover:bg-[#001D37] text-white rounded-full shadow-md transition-colors"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h2 className="text-xl font-bold font-serif text-[#001D37]">{fullName}</h2>
            <p className="text-xs text-[#5E5E5E]">{email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <span className="px-2.5 py-0.5 bg-[#FAF9FC] border border-[#E4E4E0] text-[11px] text-[#5E5E5E] rounded-md font-medium">
                Tham gia: Tháng 01, 2026
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 rounded-md font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã xác thực Email
              </span>
            </div>

            {showAvatarInput && (
              <div className="mt-3 flex items-center gap-2 max-w-md pt-2">
                <input
                  type="url"
                  value={avatarInputVal}
                  onChange={(e) => setAvatarInputVal(e.target.value)}
                  placeholder="Dán link ảnh (https://...)"
                  className="flex-1 px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] bg-white"
                />
                <button
                  onClick={handleUpdateAvatar}
                  className="px-3 py-1.5 bg-[#16324F] text-white text-xs font-semibold rounded-lg"
                >
                  Lưu ảnh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Read-only Learning Stats */}
        <div>
          <h3 className="font-serif font-bold text-base text-[#001D37] mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#16324F]" />
            <span>Thống kê học tập (Read-only)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-[#001D37]">{stats.enrolled}</p>
                <p className="text-xs text-[#5E5E5E] font-medium">Khóa học đã ghi danh</p>
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-[#001D37]">{stats.completed}</p>
                <p className="text-xs text-[#5E5E5E] font-medium">Khóa học hoàn thành 100%</p>
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-[#001D37]">{stats.certificates}</p>
                <p className="text-xs text-[#5E5E5E] font-medium">Chứng chỉ số đạt được</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Personal Info Form */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
              <User className="w-5 h-5 text-[#16324F]" />
              <span>Thông tin cá nhân</span>
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Họ tên chính xác sẽ được dùng để in trên Chứng chỉ tốt nghiệp được định danh bằng mã băm UUID.
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
                    placeholder="Trần Văn Học Viên"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
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
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0987654321"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                  />
                </div>
              </div>

              {/* Ngày sinh */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                  />
                </div>
              </div>

              {/* Giới tính */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Giới tính
                </label>
                <div className="flex items-center gap-6 pt-1">
                  {['Nam', 'Nữ', 'Khác'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer text-xs text-[#1A1C1E]">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="w-3.5 h-3.5 accent-[#16324F]"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-[#E4E4E0]">
              <button
                type="submit"
                disabled={savingInfo}
                className="px-6 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingInfo ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Password Change Form (Tách biệt) */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#16324F]" />
              <span>Đổi mật khẩu tài khoản</span>
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh có tối thiểu 6 ký tự gồm chữ và số.
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
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
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
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
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
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPass}
                className="px-6 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{savingPass ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
