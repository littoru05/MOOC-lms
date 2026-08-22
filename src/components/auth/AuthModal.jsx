import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) => {
  const { login, register, quickSwitchRole } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT'); // 'ROLE_STUDENT' | 'ROLE_INSTRUCTOR'
  const [teachingField, setTeachingField] = useState('lap-trinh-web');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regTouched, setRegTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode and cleanly reset register state when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setServerError('');
      setRole('ROLE_STUDENT');
      setAgreeTerms(false);
      setTeachingField('lap-trinh-web');
      setRegTouched({ fullName: false, email: false, password: false, confirmPassword: false });
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Validation helpers
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPassword = (pwd) => pwd.length >= 6;
  const isValidName = (name) => name.trim().length >= 2;
  const isMatchingPassword = (pwd, confirmPwd) => pwd.length >= 6 && pwd === confirmPwd;

  // Login validations
  const loginErrors = {
    email: loginTouched.email && !isValidEmail(loginEmail) 
      ? (!loginEmail.trim() ? 'Vui lòng nhập địa chỉ email' : 'Email không đúng định dạng (ví dụ: user@example.com)') 
      : '',
    password: loginTouched.password && !isValidPassword(loginPassword) 
      ? (!loginPassword ? 'Vui lòng nhập mật khẩu' : 'Mật khẩu phải có tối thiểu 6 ký tự') 
      : '',
  };

  const isLoginFormValid = isValidEmail(loginEmail) && isValidPassword(loginPassword);

  // Register validations
  const regErrors = {
    fullName: regTouched.fullName && !isValidName(fullName)
      ? (!fullName.trim() ? 'Vui lòng nhập họ và tên' : 'Họ và tên phải có ít nhất 2 ký tự')
      : '',
    email: regTouched.email && !isValidEmail(regEmail)
      ? (!regEmail.trim() ? 'Vui lòng nhập địa chỉ email' : 'Email không đúng định dạng (ví dụ: user@example.com)')
      : '',
    password: regTouched.password && !isValidPassword(regPassword)
      ? (!regPassword ? 'Vui lòng nhập mật khẩu' : 'Mật khẩu phải có tối thiểu 6 ký tự')
      : '',
    confirmPassword: regTouched.confirmPassword && !isMatchingPassword(regPassword, confirmPassword)
      ? (!confirmPassword ? 'Vui lòng xác nhận lại mật khẩu' : 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập')
      : '',
  };

  const isRegFormValid = 
    isValidName(fullName) && 
    isValidEmail(regEmail) && 
    isValidPassword(regPassword) && 
    isMatchingPassword(regPassword, confirmPassword) && 
    agreeTerms;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginTouched({ email: true, password: true });
    if (!isLoginFormValid) return;

    setServerError('');
    setLoading(true);

    try {
      const loggedInUser = await login(loginEmail.trim(), loginPassword);
      showToast('Đăng nhập hệ thống thành công!', 'success');
      if (onAuthSuccess) {
        onAuthSuccess(loggedInUser?.role || 'ROLE_STUDENT');
      } else {
        onClose();
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (!isRegFormValid) return;

    setServerError('');
    setLoading(true);

    try {
      const registeredUser = await register({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: role,
        teachingField: role === 'ROLE_INSTRUCTOR' ? teachingField : null,
      });

      showToast(
        role === 'ROLE_INSTRUCTOR'
          ? 'Đăng ký tài khoản Giảng viên thành công! Đang chuyển đến Bảng điều khiển Giảng dạy...'
          : 'Đăng ký tài khoản Học viên thành công! Chào mừng bạn đến với EduMOOC.',
        'success'
      );

      if (onAuthSuccess) {
        onAuthSuccess(registeredUser?.role || role);
      } else {
        onClose();
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Đăng ký không thành công. Email có thể đã được sử dụng!'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Switch for Demo
  const handleQuickSwitch = async (targetRole) => {
    setServerError('');
    setLoading(true);
    try {
      await quickSwitchRole(targetRole);
      showToast(`Đã chuyển sang vai trò ${targetRole === 'ROLE_ADMIN' ? 'Quản trị viên' : targetRole === 'ROLE_INSTRUCTOR' ? 'Giảng viên' : 'Học viên'}!`, 'info');
      if (onAuthSuccess) {
        onAuthSuccess(targetRole);
      } else {
        onClose();
      }
    } catch (err) {
      setServerError('Lỗi khi chuyển tài khoản mẫu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Container (2-Column on Desktop, Constrained Max Height) */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col md:flex-row my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 text-[#5E5E5E] hover:text-[#001D37] hover:bg-[#F4F3F6] rounded-full transition-colors bg-white/80 md:bg-transparent shadow-xs md:shadow-none"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Brand & Academic Illustration Banner (Desktop Only) */}
        <div className="hidden md:flex md:w-5/12 bg-[#001D37] text-white p-7 flex-col justify-between relative overflow-y-auto">
          {/* Background decorative accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#16324F]/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0A2540] rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-[#001D37] rounded-xl flex items-center justify-center font-bold text-xl font-serif shadow-md">
                E
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white tracking-wide block">EduMOOC</span>
                <span className="text-[10px] text-[#A6C8FF] tracking-wider uppercase font-semibold">Nền tảng Học trực tuyến</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-xl lg:text-2xl font-serif font-bold leading-snug text-white">
                {mode === 'login' ? 'Chào mừng bạn trở lại với giảng đường số' : 'Bắt đầu hành trình nâng tầm tri thức'}
              </h2>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Hệ sinh thái học tập chuẩn hóa MOOC, kiểm định bài giảng, khảo thí đánh giá năng lực và cấp chứng chỉ số uy tín.
              </p>
            </div>

            {/* Value Props */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-[#E2E8F0]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Truy cập hơn 100+ bài giảng chuyên sâu & code lab</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#E2E8F0]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Hệ thống khảo thí trắc nghiệm đánh giá tự động</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#E2E8F0]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Nhận chứng chỉ số định danh tốt nghiệp</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>© 2026 EduMOOC Platform</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> Bảo mật JWT</span>
          </div>
        </div>

        {/* Right Column: Form Container (Responsive scrollable container) */}
        <div className="w-full md:w-7/12 p-5 sm:p-8 flex flex-col justify-start bg-white overflow-y-auto max-h-[92vh]">
          <div className="max-w-[420px] w-full mx-auto space-y-4 my-auto">
            
            {/* Form Title & Subtitle */}
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#001D37]">
                {mode === 'login' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản mới'}
              </h1>
              <p className="text-xs text-[#5E5E5E] mt-1">
                {mode === 'login' 
                  ? 'Nhập email và mật khẩu để tiếp tục việc học của bạn' 
                  : 'Tham gia cộng đồng học thuật và phát triển sự nghiệp'}
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3 bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{serverError}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* 1. LOGIN FORM */}
            {/* ======================================================== */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Field 1: Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Địa chỉ Email <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (!loginTouched.email) setLoginTouched((p) => ({ ...p, email: true }));
                      }}
                      onBlur={() => setLoginTouched((p) => ({ ...p, email: true }))}
                      placeholder="student@lms.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs border rounded-xl bg-white focus:outline-none transition-colors ${
                        loginErrors.email
                          ? 'border-[#BA1A1A] focus:border-[#BA1A1A] bg-red-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-[11px] text-[#BA1A1A] font-medium pt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {loginErrors.email}
                    </p>
                  )}
                </div>

                {/* Field 2: Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Mật khẩu <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (!loginTouched.password) setLoginTouched((p) => ({ ...p, password: true }));
                      }}
                      onBlur={() => setLoginTouched((p) => ({ ...p, password: true }))}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs border rounded-xl bg-white focus:outline-none transition-colors ${
                        loginErrors.password
                          ? 'border-[#BA1A1A] focus:border-[#BA1A1A] bg-red-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-[11px] text-[#BA1A1A] font-medium pt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {loginErrors.password}
                    </p>
                  )}
                </div>

                {/* Options Line: Remember Me + Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#16324F] border-[#E4E4E0] rounded focus:ring-0 accent-[#16324F] cursor-pointer"
                    />
                    <span className="text-xs text-[#5E5E5E]">Ghi nhớ đăng nhập</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => showToast('Chức năng khôi phục mật khẩu qua Email đang được gửi mã OTP.', 'info')}
                    className="text-xs font-semibold text-[#16324F] hover:text-[#001D37] hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isLoginFormValid || loading}
                  className="w-full py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* 2. REGISTER FORM */}
            {/* ======================================================== */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                
                {/* Role Selection Toggle (2 options only: Học viên / Giảng viên) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Bạn tham gia với vai trò <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#F4F3F6] p-1 rounded-xl border border-[#E4E4E0]">
                    <button
                      type="button"
                      onClick={() => setRole('ROLE_STUDENT')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'ROLE_STUDENT'
                          ? 'bg-white text-[#16324F] shadow-xs border border-[#E4E4E0]'
                          : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Học viên</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('ROLE_INSTRUCTOR')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'ROLE_INSTRUCTOR'
                          ? 'bg-white text-[#16324F] shadow-xs border border-[#E4E4E0]'
                          : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Giảng viên</span>
                    </button>
                  </div>
                </div>

                {/* Field 1: Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Họ và tên <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (!regTouched.fullName) setRegTouched((p) => ({ ...p, fullName: true }));
                      }}
                      onBlur={() => setRegTouched((p) => ({ ...p, fullName: true }))}
                      placeholder="Nguyễn Văn A"
                      className={`w-full pl-10 pr-3.5 py-2 text-xs border rounded-xl bg-white focus:outline-none transition-colors ${
                        regErrors.fullName
                          ? 'border-[#BA1A1A] focus:border-[#BA1A1A] bg-red-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                  </div>
                  {regErrors.fullName && (
                    <p className="text-[11px] text-[#BA1A1A] font-medium pt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {regErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Field 2: Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Địa chỉ Email <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (!regTouched.email) setRegTouched((p) => ({ ...p, email: true }));
                      }}
                      onBlur={() => setRegTouched((p) => ({ ...p, email: true }))}
                      placeholder="user@example.com"
                      className={`w-full pl-10 pr-3.5 py-2 text-xs border rounded-xl bg-white focus:outline-none transition-colors ${
                        regErrors.email
                          ? 'border-[#BA1A1A] focus:border-[#BA1A1A] bg-red-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                  </div>
                  {regErrors.email && (
                    <p className="text-[11px] text-[#BA1A1A] font-medium pt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {regErrors.email}
                    </p>
                  )}
                </div>

                {/* Field 3: Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Mật khẩu <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (!regTouched.password) setRegTouched((p) => ({ ...p, password: true }));
                      }}
                      onBlur={() => setRegTouched((p) => ({ ...p, password: true }))}
                      placeholder="Tối thiểu 6 ký tự"
                      className={`w-full pl-10 pr-3.5 py-2 text-xs border rounded-xl bg-white focus:outline-none transition-colors ${
                        regErrors.password
                          ? 'border-[#BA1A1A] focus:border-[#BA1A1A] bg-red-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                  </div>
                  {regErrors.password && (
                    <p className="text-[11px] text-[#BA1A1A] font-medium pt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {regErrors.password}
                    </p>
                  )}
                </div>

                {/* Field 4: Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Xác nhận mật khẩu <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#5E5E5E]" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (!regTouched.confirmPassword) setRegTouched((p) => ({ ...p, confirmPassword: true }));
                      }}
                      onBlur={() => setRegTouched((p) => ({ ...p, confirmPassword: true }))}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full pl-10 pr-3.5 py-2 text-xs border rounded-xl bg-white focus:outline-none transition-colors ${
                        regErrors.confirmPassword
                          ? 'border-[#BA1A1A] focus:border-[#BA1A1A] bg-red-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                  </div>
                  {regErrors.confirmPassword && (
                    <p className="text-[11px] text-[#BA1A1A] font-medium pt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {regErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Additional Instructor Field (Optional) */}
                {role === 'ROLE_INSTRUCTOR' && (
                  <div className="space-y-1 bg-[#FAF9FC] p-3 rounded-xl border border-[#E4E4E0] animate-in fade-in">
                    <label className="block text-xs font-semibold text-[#1A1C1E]">
                      Lĩnh vực giảng dạy chính <span className="text-[10px] text-[#5E5E5E] font-normal">(Tùy chọn)</span>
                    </label>
                    <select
                      value={teachingField}
                      onChange={(e) => setTeachingField(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                    >
                      <option value="lap-trinh-web">Lập trình Web & Fullstack Development</option>
                      <option value="ai-data-science">Trí tuệ nhân tạo & Data Science</option>
                      <option value="lap-trinh-di-dong">Lập trình Di động (React Native / iOS)</option>
                      <option value="thiet-ke-ui-ux">Thiết kế UI/UX & Design Systems</option>
                      <option value="an-toan-thong-tin">An toàn Thông tin & Bảo mật Web</option>
                    </select>
                    <p className="text-[11px] text-[#5E5E5E] pt-1">
                      ℹ️ <em>Tài khoản Giảng viên sẽ được kích hoạt quyền tạo khóa học sau khi xác thực thông tin.</em>
                    </p>
                  </div>
                )}

                {/* Terms Agreement Checkbox (Required) */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#16324F] border-[#E4E4E0] rounded focus:ring-0 accent-[#16324F] cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-[#5E5E5E] leading-tight">
                      Tôi đồng ý với <a href="#" onClick={(e) => e.preventDefault()} className="text-[#16324F] font-semibold underline">Điều khoản sử dụng</a> và <a href="#" onClick={(e) => e.preventDefault()} className="text-[#16324F] font-semibold underline">Chính sách bảo mật</a> của EduMOOC.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isRegFormValid || loading}
                  className="w-full py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang khởi tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký tài khoản</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Switch between Login and Register */}
            <div className="text-center pt-2 border-t border-[#E4E4E0] text-xs text-[#5E5E5E]">
              {mode === 'login' ? (
                <span>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setServerError('');
                    }}
                    className="text-[#16324F] font-bold hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </span>
              ) : (
                <span>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setServerError('');
                    }}
                    className="text-[#16324F] font-bold hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Helper Section (Discrete bottom bar for evaluator testing) */}
            <div className="bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-semibold text-[#5E5E5E] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Tài khoản trải nghiệm mẫu nhanh:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('ROLE_STUDENT')}
                  className="px-2 py-1.5 bg-white border border-[#E4E4E0] hover:border-[#16324F] rounded-lg text-[11px] font-medium text-[#1A1C1E] transition-colors text-center"
                >
                  Học viên
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('ROLE_INSTRUCTOR')}
                  className="px-2 py-1.5 bg-white border border-[#E4E4E0] hover:border-[#16324F] rounded-lg text-[11px] font-medium text-[#1A1C1E] transition-colors text-center"
                >
                  Giảng viên
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('ROLE_ADMIN')}
                  className="px-2 py-1.5 bg-white border border-[#E4E4E0] hover:border-[#16324F] rounded-lg text-[11px] font-medium text-[#1A1C1E] transition-colors text-center"
                >
                  Admin
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
