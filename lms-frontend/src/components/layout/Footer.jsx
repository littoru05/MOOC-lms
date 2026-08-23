import React from 'react';

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
              <li><a href="#" className="hover:text-[#16324F]">Lập trình Web Fullstack</a></li>
              <li><a href="#" className="hover:text-[#16324F]">Trí tuệ nhân tạo & Data</a></li>
              <li><a href="#" className="hover:text-[#16324F]">Lập trình Di động</a></li>
              <li><a href="#" className="hover:text-[#16324F]">Kiến trúc phần mềm</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider mb-3">Dành cho Giảng viên</h4>
            <ul className="space-y-2 text-xs text-[#5E5E5E]">
              <li><a href="#" className="hover:text-[#16324F]">Biên soạn khóa học</a></li>
              <li><a href="#" className="hover:text-[#16324F]">Tạo đề thi trắc nghiệm</a></li>
              <li><a href="#" className="hover:text-[#16324F]">Quy chuẩn kiểm duyệt</a></li>
              <li><a href="#" className="hover:text-[#16324F]">Theo dõi học viên</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider mb-3">Hệ thống</h4>
            <p className="text-xs text-[#5E5E5E] mb-2">Kiến trúc Monolithic 3-Layer</p>
            <p className="text-xs text-[#5E5E5E] mb-2">Spring Boot 4 • Java 21 • MySQL 8.0</p>
            <p className="text-xs text-[#5E5E5E]">React 19 • Tailwind CSS • Stitch Design</p>
          </div>
        </div>

        <div className="border-t border-[#E4E4E0] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6B6B]">
          <p>© 2026 EduMOOC Platform. Thiết kế theo tiêu chuẩn Scholarly SaaS.</p>
          <p className="mt-2 sm:mt-0">Đề tài Bài tập lớn Phát triển Ứng dụng Web & E-Learning</p>
        </div>
      </div>
    </footer>
  );
};
