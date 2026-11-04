import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Laptop,
  Check,
} from 'lucide-react';

// Slogan list rotating in illustration panel
const SLOGANS = [
  {
    quote: 'Học theo lộ trình riêng, vững bước tương lai',
    detail: 'Cá nhân hóa tiến độ học tập với bài giảng tương tác và phòng lab lập trình thực chiến.',
  },
  {
    quote: 'Làm chủ kiến thức công nghệ hiện đại',
    detail: 'Giáo trình chuẩn MOOC bám sát yêu cầu thực tiễn từ các doanh nghiệp công nghệ hàng đầu.',
  },
  {
    quote: 'Nhận chứng chỉ số định danh quốc tế',
    detail: 'Khảo thí đánh giá năng lực độc lập, cấp chứng chỉ điện tử có mã tra cứu công khai.',
  },
  {
    quote: 'Đồng hành cùng giảng viên chuyên gia',
    detail: 'Tương tác học thuật trực tiếp, nhận góp ý chi tiết cho từng dự án và bài tập thực hành.',
  },
];

// Helper to calculate password strength
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '', text: '' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) {
    return { score: 1, label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-600' };
  }
  if (score <= 3) {
    return { score: 2, label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-600' };
  }
  return { score: 3, label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-600' };
};

// Reusable Floating Label Input Component
const FloatingInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  placeholder,
  autoComplete,
  disabled,
  required,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const isFloating = focused || Boolean(value);

  return (
    <div className="space-y-1">
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5E5E5E]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            if (onBlur) onBlur(e);
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} ${
            isPassword ? 'pr-10' : 'pr-3.5'
          } pt-3.5 pb-2.5 text-xs bg-white border rounded-xl font-medium text-[#1A1C1E] placeholder-transparent focus:placeholder-[#8E8E93] focus:outline-none transition-all ${
            error
              ? 'border-[#BA1A1A] focus:border-[#BA1A1A] focus:ring-2 focus:ring-[#BA1A1A]/15 bg-rose-50/20'
              : 'border-[#E4E4E0] focus:border-[#16324F] focus:ring-2 focus:ring-[#16324F]/15'
          }`}
        />
        <label
          htmlFor={id}
          className={`absolute pointer-events-none transition-all duration-200 select-none ${
            Icon ? 'left-10' : 'left-3.5'
          } ${
            isFloating
              ? '-top-2 text-[10px] font-bold px-1.5 bg-white rounded z-10 ' +
                (error ? 'text-[#BA1A1A]' : focused ? 'text-[#16324F]' : 'text-[#5E5E5E]')
              : 'top-1/2 -translate-y-1/2 text-xs text-[#8E8E93]'
          }`}
        >
          {label} {required && <span className="text-[#BA1A1A]">*</span>}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8E8E93] hover:text-[#1A1C1E] cursor-pointer"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-[#BA1A1A] font-medium pt-0.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export const LoginPage = ({ initialMode = 'login' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();
  const { showToast } = useToast();

  // Mode synced with URL route
  const currentMode = location.pathname === '/register' ? 'register' : initialMode;
  const [mode, setMode] = useState(currentMode);

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Rotating slogans in illustration panel
  const [sloganIndex, setSloganIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % SLOGANS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Alert notice when loggedOut or expired
  const [alertInfo, setAlertInfo] = useState(() => {
    if (location.state?.loggedOut) {
      return { type: 'success', text: 'Bạn đã đăng xuất thành công.' };
    }
    if (location.state?.expired) {
      return {
        type: 'warning',
        text: location.state?.message || 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
      };
    }
    return null;
  });

  useEffect(() => {
    if (alertInfo) {
      const timer = setTimeout(() => {
        setAlertInfo(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ROLE_INSTRUCTOR' || user.role === 'INSTRUCTOR') {
        navigate('/instructor/dashboard', { replace: true });
      } else if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const destination = location.state?.from?.pathname || '/';
        navigate(destination, { replace: true });
      }
    }
  }, [user, loading, navigate, location.state]);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });

  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [teachingField, setTeachingField] = useState('lap-trinh-web');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regTouched, setRegTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Quick Demo Accounts config
  const showDemoAccounts = import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true';

  // Validation helpers
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPassword = (pwd) => pwd.length >= 6;
  const isValidName = (name) => name.trim().length >= 2;
  const isMatchingPassword = (pwd, confirmPwd) => pwd.length >= 6 && pwd === confirmPwd;

  const loginErrors = {
    email:
      loginTouched.email && !isValidEmail(loginEmail)
        ? !loginEmail.trim()
          ? 'Vui lòng nhập địa chỉ email'
          : 'Email không đúng định dạng (ví dụ: user@example.com)'
        : '',
    password:
      loginTouched.password && !isValidPassword(loginPassword)
        ? !loginPassword
          ? 'Vui lòng nhập mật khẩu'
          : 'Mật khẩu phải có tối thiểu 6 ký tự'
        : '',
  };
  const isLoginFormValid = isValidEmail(loginEmail) && isValidPassword(loginPassword);

  const regErrors = {
    fullName:
      regTouched.fullName && !isValidName(fullName)
        ? !fullName.trim()
          ? 'Vui lòng nhập họ và tên'
          : 'Họ và tên phải có ít nhất 2 ký tự'
        : '',
    email:
      regTouched.email && !isValidEmail(regEmail)
        ? !regEmail.trim()
          ? 'Vui lòng nhập địa chỉ email'
          : 'Email không đúng định dạng (ví dụ: user@example.com)'
        : '',
    password:
      regTouched.password && !isValidPassword(regPassword)
        ? !regPassword
          ? 'Vui lòng nhập mật khẩu'
          : 'Mật khẩu phải có tối thiểu 6 ký tự'
        : '',
    confirmPassword:
      regTouched.confirmPassword && !isMatchingPassword(regPassword, confirmPassword)
        ? !confirmPassword
          ? 'Vui lòng xác nhận lại mật khẩu'
          : 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập'
        : '',
  };
  const isRegFormValid =
    isValidName(fullName) &&
    isValidEmail(regEmail) &&
    isValidPassword(regPassword) &&
    isMatchingPassword(regPassword, confirmPassword) &&
    agreeTerms;

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Switch between /login and /register
  const handleSwitchMode = (nextMode) => {
    setServerError('');
    setMode(nextMode);
    if (nextMode === 'register') {
      navigate('/register', { replace: false, state: location.state });
    } else {
      navigate('/login', { replace: false, state: location.state });
    }
  };

  // Autofill demo accounts
  const handleFillDemo = (demoEmail, demoPassword) => {
    setLoginEmail(demoEmail);
    setLoginPassword(demoPassword);
    setLoginTouched({ email: true, password: true });
    setServerError('');
  };

  // Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginTouched({ email: true, password: true });

    if (!isLoginFormValid) {
      triggerShake();
      return;
    }

    setServerError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(loginEmail.trim(), loginPassword);
      setIsSuccess(true);
      showToast('Đăng nhập hệ thống thành công!', 'success');

      setTimeout(() => {
        const targetRole = loggedInUser?.role || 'ROLE_STUDENT';
        if (targetRole === 'ROLE_INSTRUCTOR' || targetRole === 'INSTRUCTOR') {
          navigate('/instructor/dashboard', { replace: true });
        } else if (targetRole === 'ROLE_ADMIN' || targetRole === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      }, 350);
    } catch (err) {
      triggerShake();
      setServerError(
        err.response?.data?.message ||
          'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegTouched({ fullName: true, email: true, password: true, confirmPassword: true });

    if (!isRegFormValid) {
      triggerShake();
      return;
    }

    setServerError('');
    setIsSubmitting(true);

    try {
      const registeredUser = await register({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: role,
        teachingField: role === 'ROLE_INSTRUCTOR' ? teachingField : null,
      });

      setIsSuccess(true);
      showToast(
        role === 'ROLE_INSTRUCTOR'
          ? 'Đăng ký tài khoản Giảng viên thành công!'
          : 'Đăng ký tài khoản Học viên thành công! Chào mừng bạn đến với EduMOOC.',
        'success'
      );

      setTimeout(() => {
        const targetRole = registeredUser?.role || role;
        if (targetRole === 'ROLE_INSTRUCTOR' || targetRole === 'INSTRUCTOR') {
          navigate('/instructor/dashboard', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      }, 350);
    } catch (err) {
      triggerShake();
      setServerError(
        err.response?.data?.message ||
          'Đăng ký không thành công. Email có thể đã được sử dụng!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(regPassword);

  // If already logged in, do not render form
  if (!loading && user) {
    return null;
  }

  const isLoginMode = mode === 'login';

  return (
    <div className="min-h-screen w-full relative bg-[#FAF9FC] flex flex-col overflow-x-hidden">
      {/* Toast Notice Banner on Logout or Session Expiry */}
      {alertInfo && (
        <div
          data-testid="logout-alert-notice"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#E4E4E0] shadow-xl rounded-xl text-xs font-semibold animate-card-entry"
        >
          {alertInfo.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span className="text-[#1A1C1E]">{alertInfo.text}</span>
        </div>
      )}

      {/* Main Split Layout with Sliding Transform Transition */}
      <div className="flex-1 w-full flex flex-col lg:flex-row relative">
        {/* ================================================================ */}
        {/* PANEL 1: Academic Illustration Showcase (Sliding half)            */}
        {/* ================================================================ */}
        <div
          className={`w-full lg:w-1/2 min-h-[300px] lg:min-h-screen relative overflow-hidden bg-gradient-to-br from-[#001D37] via-[#16324F] to-[#0A2540] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 transition-transform duration-700 ease-in-out motion-reduce:transition-none motion-reduce:transform-none ${
            isLoginMode ? 'lg:translate-x-0' : 'lg:translate-x-full'
          }`}
        >
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>



          {/* Top: Brand Identity Header */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white text-[#001D37] rounded-xl flex items-center justify-center font-bold text-xl font-serif shadow-md transition-transform group-hover:scale-105">
                E
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-white tracking-wide block">
                  EduMOOC
                </span>
                <span className="text-[10px] text-[#A6C8FF] tracking-wider uppercase font-semibold block">
                  Nền tảng Học trực tuyến
                </span>
              </div>
            </Link>

            {/* Direct Home Link on mobile banner */}
            <Link
              to="/"
              className="lg:hidden text-xs text-white/80 hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>Trang chủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Center: Dynamic Rotating Intro Message */}
          <div className="relative z-10 my-auto py-6 max-w-md xl:max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-[11px] font-semibold text-cyan-200 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Học tập theo năng lực • Đạt chuẩn tương lai</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-white leading-tight min-h-[76px] transition-all duration-300">
              {SLOGANS[sloganIndex].quote}
            </h2>

            <p className="text-xs sm:text-sm text-[#CBD5E1] mt-3 leading-relaxed min-h-[44px]">
              {SLOGANS[sloganIndex].detail}
            </p>

            {/* Slogan Dots Indicator */}
            <div className="flex items-center gap-2 mt-5">
              {SLOGANS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSloganIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    sloganIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Xem thông điệp ${idx + 1}`}
                />
              ))}
            </div>

            {/* Academic Features Grid (Organized & Structured 2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 mt-6 border-t border-white/10">
              <div className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 backdrop-blur-sm flex items-center gap-3 transition-all hover:scale-[1.02]">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">100+ Khóa học</h4>
                  <p className="text-[11px] text-[#A6C8FF] truncate">Giáo trình MOOC chuẩn mực</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 backdrop-blur-sm flex items-center gap-3 transition-all hover:scale-[1.02]">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">Lộ trình riêng</h4>
                  <p className="text-[11px] text-[#A6C8FF] truncate">Cá nhân hóa theo năng lực</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 backdrop-blur-sm flex items-center gap-3 transition-all hover:scale-[1.02]">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">Chứng chỉ số</h4>
                  <p className="text-[11px] text-[#A6C8FF] truncate">Định danh & tra cứu tức thì</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 backdrop-blur-sm flex items-center gap-3 transition-all hover:scale-[1.02]">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">Khảo thí tự động</h4>
                  <p className="text-[11px] text-[#A6C8FF] truncate">Đánh giá năng lực chuẩn xác</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Security & Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>© 2026 EduMOOC Platform</span>
            <span className="flex items-center gap-1.5 text-[#E2E8F0]">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>Bảo mật dữ liệu chuẩn SSL/TLS</span>
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PANEL 2: Form Container (Sliding half)                           */}
        {/* ================================================================ */}
        <div
          className={`w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 z-0 transition-transform duration-700 ease-in-out motion-reduce:transition-none motion-reduce:transform-none bg-[#FAF9FC] ${
            isLoginMode ? 'lg:translate-x-0' : 'lg:-translate-x-full'
          }`}
        >
          <div className="w-full max-w-[420px] mx-auto py-6">
            {/* Top Navigation: Return to Home */}
            <div className="mb-6 flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E5E5E] hover:text-[#16324F] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay về trang chủ</span>
              </Link>
            </div>

            {/* Form Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#001D37] tracking-tight">
                {isLoginMode ? 'Chào mừng bạn trở lại' : 'Bắt đầu hành trình nâng tầm tri thức'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1.5 leading-relaxed">
                {isLoginMode
                  ? 'Đăng nhập để tiếp tục lộ trình học tập và kiểm tra tiến độ.'
                  : 'Tạo tài khoản học tập miễn phí để mở khóa kho khóa học chất lượng.'}
              </p>
            </div>

            {/* Server Error Message */}
            {serverError && (
              <div className="mb-5 p-3.5 bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] text-xs rounded-xl flex items-start gap-2.5 animate-card-entry">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{serverError}</span>
              </div>
            )}

            {/* Quick Demo Accounts Helper (Only when VITE_SHOW_DEMO_ACCOUNTS=true) */}
            {showDemoAccounts && isLoginMode && (
              <div className="mb-6 p-3 bg-white border border-[#E4E4E0] rounded-xl shadow-2xs space-y-2">
                <div className="text-[11px] font-bold text-[#16324F] flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-[#16324F]" />
                  <span>Đăng nhập nhanh (Tài khoản mẫu):</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('student@lms.com', 'student123')}
                    className="py-1.5 px-2 text-[11px] font-semibold bg-[#FAF9FC] hover:bg-[#F4F3F6] text-[#16324F] rounded-lg border border-[#E4E4E0] transition-colors cursor-pointer text-center"
                  >
                    Học viên
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('instructor@lms.com', 'instructor123')}
                    className="py-1.5 px-2 text-[11px] font-semibold bg-[#FAF9FC] hover:bg-[#F4F3F6] text-[#16324F] rounded-lg border border-[#E4E4E0] transition-colors cursor-pointer text-center"
                  >
                    Giảng viên
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin@lms.com', 'admin123')}
                    className="py-1.5 px-2 text-[11px] font-semibold bg-[#FAF9FC] hover:bg-[#F4F3F6] text-[#16324F] rounded-lg border border-[#E4E4E0] transition-colors cursor-pointer text-center"
                  >
                    Quản trị
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 1. LOGIN FORM                                                */}
            {/* ============================================================ */}
            {isLoginMode ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <FloatingInput
                  id="login-email"
                  label="Địa chỉ Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (!loginTouched.email) setLoginTouched((p) => ({ ...p, email: true }));
                  }}
                  onBlur={() => setLoginTouched((p) => ({ ...p, email: true }))}
                  error={loginErrors.email}
                  icon={Mail}
                  placeholder="student@lms.com"
                  autoComplete="email"
                  required
                />

                <FloatingInput
                  id="login-password"
                  label="Mật khẩu"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (!loginTouched.password) setLoginTouched((p) => ({ ...p, password: true }));
                  }}
                  onBlur={() => setLoginTouched((p) => ({ ...p, password: true }))}
                  error={loginErrors.password}
                  icon={Lock}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                {/* Remember Me Toggle */}
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
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isLoginFormValid || isSubmitting}
                  className={`w-full py-3 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                    isShaking ? 'animate-shake' : ''
                  } ${
                    isSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#16324F] hover:bg-[#001D37] text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực tài khoản...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đăng nhập thành công!</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ============================================================ */
              /* 2. REGISTER FORM                                             */
              /* ============================================================ */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Role Switch: Student vs Instructor */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1A1C1E]">
                    Bạn tham gia với vai trò <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#F4F3F6] p-1 rounded-xl border border-[#E4E4E0]">
                    <button
                      type="button"
                      onClick={() => setRole('ROLE_STUDENT')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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

                <FloatingInput
                  id="reg-fullname"
                  label="Họ và tên"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!regTouched.fullName) setRegTouched((p) => ({ ...p, fullName: true }));
                  }}
                  onBlur={() => setRegTouched((p) => ({ ...p, fullName: true }))}
                  error={regErrors.fullName}
                  icon={User}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  required
                />

                <FloatingInput
                  id="reg-email"
                  label="Địa chỉ Email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (!regTouched.email) setRegTouched((p) => ({ ...p, email: true }));
                  }}
                  onBlur={() => setRegTouched((p) => ({ ...p, email: true }))}
                  error={regErrors.email}
                  icon={Mail}
                  placeholder="user@example.com"
                  autoComplete="email"
                  required
                />

                <div>
                  <FloatingInput
                    id="reg-password"
                    label="Mật khẩu"
                    type="password"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (!regTouched.password) setRegTouched((p) => ({ ...p, password: true }));
                    }}
                    onBlur={() => setRegTouched((p) => ({ ...p, password: true }))}
                    error={regErrors.password}
                    icon={Lock}
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                    required
                  />

                  {/* Password Strength Indicator */}
                  {regPassword && (
                    <div className="mt-2 space-y-1.5 p-2 bg-white border border-[#E4E4E0] rounded-lg">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#5E5E5E]">Độ bảo mật mật khẩu:</span>
                        <span className={`font-bold ${passwordStrength.text}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 h-1.5 w-full bg-[#E4E4E0] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                          }`}
                        />
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                          }`}
                        />
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <FloatingInput
                  id="reg-confirm-password"
                  label="Xác nhận mật khẩu"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (!regTouched.confirmPassword)
                      setRegTouched((p) => ({ ...p, confirmPassword: true }));
                  }}
                  onBlur={() => setRegTouched((p) => ({ ...p, confirmPassword: true }))}
                  error={regErrors.confirmPassword}
                  icon={Lock}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  required
                />

                {/* Additional Instructor Field */}
                {role === 'ROLE_INSTRUCTOR' && (
                  <div className="space-y-1 bg-white p-3 rounded-xl border border-[#E4E4E0] animate-card-entry">
                    <label className="block text-xs font-semibold text-[#1A1C1E]">
                      Lĩnh vực giảng dạy chính{' '}
                      <span className="text-[10px] text-[#5E5E5E] font-normal">(Tùy chọn)</span>
                    </label>
                    <select
                      value={teachingField}
                      onChange={(e) => setTeachingField(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg bg-[#FAF9FC] focus:bg-white focus:outline-none focus:border-[#16324F]"
                    >
                      <option value="lap-trinh-web">Lập trình Web & Fullstack Development</option>
                      <option value="ai-data-science">Trí tuệ nhân tạo & Data Science</option>
                      <option value="lap-trinh-di-dong">Lập trình Di động (React Native / iOS)</option>
                      <option value="thiet-ke-ui-ux">Thiết kế UI/UX & Design Systems</option>
                      <option value="an-toan-thong-tin">An toàn Thông tin & Bảo mật Web</option>
                    </select>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#16324F] border-[#E4E4E0] rounded focus:ring-0 accent-[#16324F] cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-[#5E5E5E] leading-tight">
                      Tôi đồng ý với{' '}
                      <span className="text-[#16324F] font-semibold underline">
                        Điều khoản dịch vụ
                      </span>{' '}
                      và{' '}
                      <span className="text-[#16324F] font-semibold underline">
                        Chính sách bảo mật
                      </span>{' '}
                      của EduMOOC.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isRegFormValid || isSubmitting}
                  className={`w-full py-3 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-3 ${
                    isShaking ? 'animate-shake' : ''
                  } ${
                    isSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#16324F] hover:bg-[#001D37] text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang khởi tạo tài khoản...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đăng ký thành công!</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký tài khoản</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Link between Login and Register */}
            <div className="text-center pt-5 mt-5 border-t border-[#E4E4E0] text-xs text-[#5E5E5E]">
              {isLoginMode ? (
                <span>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-[#16324F] font-bold hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </span>
              ) : (
                <span>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-[#16324F] font-bold hover:underline cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
