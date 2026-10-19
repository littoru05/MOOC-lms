import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#E4E4E0] mt-20">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#16324F] text-white rounded-lg flex items-center justify-center font-bold text-base font-serif">
                E
              </div>
              <span className="text-xl font-bold font-serif text-[#001D37]">EduMOOC</span>
            </div>
            <p className="text-xs text-[#5E5E5E] leading-relaxed">
              Hệ thống quản lý đào tạo trực tuyến quy mô lớn (MOOC) chuẩn học thuật hiện đại. Học tập theo lộ trình, làm bài khảo thí và nhận chứng chỉ số có mã băm UUID xác thực công khai.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider mb-3">Khám phá</h4>
            <ul className="space-y-2 text-xs text-[#5E5E5E]">
              <li><Link to="/courses?category=lap-trinh-web" className="hover:text-[#16324F] transition-colors">Lập trình Web Fullstack</Link></li>
              <li><Link to="/courses?category=tri-tue-nhan-tao" className="hover:text-[#16324F] transition-colors">Trí tuệ nhân tạo & Data</Link></li>
              <li><Link to="/courses?category=lap-trinh-di-dong" className="hover:text-[#16324F] transition-colors">Lập trình Di động</Link></li>
              <li><Link to="/courses?category=kien-truc-phan-mem" className="hover:text-[#16324F] transition-colors">Kiến trúc phần mềm</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider mb-3">Dành cho Giảng viên</h4>
            <ul className="space-y-2 text-xs text-[#5E5E5E]">
              <li><Link to="/instructor/courses/create" className="hover:text-[#16324F] transition-colors">Biên soạn khóa học</Link></li>
              <li><Link to="/instructor/dashboard" className="hover:text-[#16324F] transition-colors">Tạo đề thi trắc nghiệm</Link></li>
              <li><Link to="/certificates" className="hover:text-[#16324F] transition-colors">Tra cứu chứng chỉ số</Link></li>
              <li><Link to="/instructor/students" className="hover:text-[#16324F] transition-colors">Theo dõi học viên</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider mb-3">Liên hệ & Hỗ trợ</h4>
            <p className="text-xs text-[#5E5E5E] mb-1.5">Tòa nhà Công nghệ EduMOOC, Khu Đô thị ĐHQG, Hà Nội</p>
            <p className="text-xs text-[#5E5E5E] mb-1.5">
              Email: <a href="mailto:support@edumooc.edu.vn" className="hover:text-[#16324F] font-medium transition-colors">support@edumooc.edu.vn</a>
            </p>
            <p className="text-xs text-[#5E5E5E]">
              Hotline: <span className="font-semibold text-[#001D37]">1900 6868</span> (08:00 - 21:00)
            </p>
          </div>
        </div>

        <div className="border-t border-[#E4E4E0] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6B6B]">
          <p>© 2026 EduMOOC Platform. Nền tảng Đào tạo & Khảo thí Trực tuyến Mở (MOOC).</p>
          <p className="mt-2 sm:mt-0">Bảo lưu mọi quyền • Tiêu chuẩn Học thuật Quốc tế</p>
        </div>
      </div>
    </footer>
  );
};
