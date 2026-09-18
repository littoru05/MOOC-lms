import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../../components/common/ImageUploadInput';
import { getImageUrl } from '../../utils/imageUrl';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  BookOpen, 
  Star, 
  Users, 
  Lock, 
  Camera, 
  Save, 
  KeyRound, 
  Award, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export const InstructorProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  // Instructor Info State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [title, setTitle] = useState(user?.title || '');
  const [teachingField, setTeachingField] = useState(user?.teachingField || 'lap-trinh-web');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
  );
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setTitle(user.title || '');
      setTeachingField(user.teachingField || 'lap-trinh-web');
      setBio(user.bio || '');
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const handleSaveInfo = async (e) => {
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
    try {
      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim(),
        phone: phone.trim() || null,
        title: title.trim() || null,
        teachingField: teachingField || null,
        bio: bio.trim() || null,
      });
      showToast('Đã cập nhật hồ sơ giảng viên thành công!', 'success');
    } catch (err) {
      console.error('Lỗi khi lưu thông tin giảng viên:', err);
      showToast(err.response?.data?.message || err.message || 'Lỗi khi lưu thông tin hồ sơ!', 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
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
    try {
      await changePassword({
        oldPassword,
        newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Đổi mật khẩu thành công!', 'success');
    } catch (err) {
      console.error('Lỗi khi đổi mật khẩu:', err);
      showToast(err.response?.data?.message || 'Mật khẩu hiện tại không chính xác!', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  const handleAvatarChange = async (newAvt) => {
    setAvatarUrl(newAvt);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: newAvt,
        phone: phone.trim() || null,
        title: title.trim() || null,
        teachingField: teachingField || null,
        bio: bio.trim() || null,
      });
      showToast('Đã cập nhật ảnh đại diện giảng viên!', 'success');
    } catch (err) {
      showToast('Đã đổi ảnh đại diện!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-10 px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#16324F] uppercase tracking-wider">Hồ sơ Chuyên gia</span>
            <h1 className="text-2xl font-bold font-serif text-[#001D37] mt-1">
              Hồ sơ Giảng viên & Học hàm
            </h1>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Thông tin học hàm, học vị và tiểu sử sẽ được hiển thị công khai trên toàn bộ các khóa học bạn giảng dạy
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1.5 self-start sm:self-auto">
            <Award className="w-4 h-4" /> Giảng viên (ROLE_INSTRUCTOR)
          </span>
        </div>

        {/* Top Profile Card */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <img
              src={getImageUrl(avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200')}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#16324F] shadow-sm"
            />
            <button
              onClick={() => setShowAvatarInput(!showAvatarInput)}
              className="absolute bottom-0 right-0 p-2 bg-[#16324F] hover:bg-[#001D37] text-white rounded-full shadow-md transition-colors cursor-pointer"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1 w-full">
            <h2 className="text-xl font-bold font-serif text-[#001D37]">{fullName}</h2>
            <p className="text-xs font-medium text-[#16324F]">{title}</p>
            <p className="text-xs text-[#5E5E5E]">{email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 rounded-md font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã kiểm định tư cách giảng dạy
              </span>
            </div>

            {showAvatarInput && (
              <div className="mt-4 pt-3 border-t border-[#E4E4E0] max-w-xl">
                <ImageUploadInput
                  value={avatarUrl}
                  onChange={handleAvatarChange}
                  label="Cập nhật ảnh đại diện giảng viên"
                  placeholder="Dán link ảnh hoặc tải file ảnh từ máy..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Read-only Teaching Stats */}
        <div>
          <h3 className="font-serif font-bold text-base text-[#001D37] mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#16324F]" />
            <span>Thống kê giảng dạy (Read-only)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-[#001D37]">6</p>
                <p className="text-xs text-[#5E5E5E] font-medium">Tổng khóa học đã tạo</p>
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-[#001D37]">45.200+</p>
                <p className="text-xs text-[#5E5E5E] font-medium">Tổng học viên đăng ký</p>
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-[#001D37]">4.92 / 5.0</p>
                <p className="text-xs text-[#5E5E5E] font-medium">Đánh giá trung bình từ học viên</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Professional Profile Form */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
              <User className="w-5 h-5 text-[#16324F]" />
              <span>Thông tin cá nhân & Nghề nghiệp</span>
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Cập nhật thông tin tiểu sử và lĩnh vực chuyên môn để học viên tin tưởng lựa chọn khóa học
            </p>
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Họ và tên */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Họ và tên giảng viên <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="TS. Nguyễn Văn A"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
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
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Số điện thoại liên hệ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                  />
                </div>
              </div>

              {/* Chức danh / Học vị */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Chức danh / Học hàm / Vị trí chuyên môn <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senior Fullstack Architect & Giảng viên ĐH Bách Khoa"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                  />
                </div>
              </div>

              {/* Lĩnh vực giảng dạy chính */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Lĩnh vực chuyên môn đào tạo chính
                </label>
                <select
                  value={teachingField}
                  onChange={(e) => setTeachingField(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl bg-white focus:outline-none focus:border-[#16324F]"
                >
                  <option value="lap-trinh-web">Lập trình Web & Fullstack Architecture</option>
                  <option value="ai-data-science">Trí tuệ nhân tạo, Machine Learning & Data Science</option>
                  <option value="lap-trinh-di-dong">Lập trình Di động Đa nền tảng (React Native / iOS)</option>
                  <option value="thiet-ke-ui-ux">Thiết kế UI/UX & Hệ thống Design System</option>
                  <option value="an-toan-thong-tin">An toàn Thông tin & Bảo mật Ứng dụng Web</option>
                </select>
              </div>

              {/* Tiểu sử / Giới thiệu */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Tiểu sử & Giới thiệu bản thân <span className="text-[10px] text-[#5E5E5E] font-normal">(Hiển thị công khai ở trang chi tiết khóa học)</span>
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mô tả quá trình công tác, thành tựu nghiên cứu và kinh nghiệm thực chiến..."
                  className="w-full p-3.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white leading-relaxed"
                />
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-[#E4E4E0]">
              <button
                type="submit"
                disabled={savingInfo}
                className="px-6 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingInfo ? 'Đang lưu...' : 'Lưu hồ sơ giảng viên'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Password Change Form */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#16324F]" />
              <span>Đổi mật khẩu tài khoản Giảng viên</span>
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Bảo mật tài khoản để bảo vệ giáo trình, đề thi và quyền quản trị khóa học
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
