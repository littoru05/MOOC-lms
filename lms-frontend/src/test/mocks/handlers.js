import { http, HttpResponse } from 'msw';

export const mockCourses = [
  {
    id: 1,
    title: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
    slug: 'lap-trinh-fullstack-web-react-spring-boot',
    description: 'Khóa học toàn diện từ Frontend tới Backend và triển khai Docker.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    level: 'BEGINNER',
    status: 'PUBLISHED',
    instructor: {
      id: 2,
      fullName: 'TS. Nguyễn Văn A',
      email: 'instructor@lms.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    category: {
      id: 1,
      name: 'Lập trình Web',
      slug: 'lap-trinh-web',
    },
    sections: [
      {
        id: 1,
        title: 'Chương 1: Khởi động dự án',
        orderIndex: 1,
        lessons: [
          { id: 101, title: 'Bài 1: Giới thiệu hệ sinh thái LMS', durationMinutes: 10, contentType: 'VIDEO' },
          { id: 102, title: 'Bài 2: Cài đặt JDK 21 & Node.js', durationMinutes: 15, contentType: 'VIDEO' },
        ],
      },
    ],
    totalDurationMinutes: 25,
    enrolledCount: 42,
  },
  {
    id: 2,
    title: 'Kiến trúc Vi dịch vụ và Cloud Native',
    slug: 'kien-truc-vi-dich-vu-cloud-native',
    description: 'Chuyên sâu Microservices, Docker, Kubernetes và Spring Cloud.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
    level: 'ADVANCED',
    status: 'PUBLISHED',
    instructor: {
      id: 2,
      fullName: 'TS. Nguyễn Văn A',
      email: 'instructor@lms.com',
    },
    category: {
      id: 1,
      name: 'Lập trình Web',
      slug: 'lap-trinh-web',
    },
    sections: [],
    totalDurationMinutes: 60,
    enrolledCount: 15,
  },
];

export const mockCategories = [
  { id: 1, name: 'Lập trình Web', slug: 'lap-trinh-web' },
  { id: 2, name: 'Trí tuệ nhân tạo', slug: 'tri-tue-nhan-tao' },
];

export const handlers = [
  // 1. Categories
  http.get('*/api/v1/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // 2. Public courses
  http.get('*/api/v1/courses/public', () => {
    return HttpResponse.json(mockCourses);
  }),

  // 3. Course detail by slug
  http.get('*/api/v1/courses/public/:slug', ({ params }) => {
    const { slug } = params;
    const course = mockCourses.find((c) => c.slug === slug);
    if (!course) {
      return new HttpResponse(JSON.stringify({ message: 'Khóa học không tồn tại!' }), { status: 404 });
    }
    return HttpResponse.json(course);
  }),

  // 4. Auth: Login
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;

    if (email === 'instructor@lms.com' && password === 'instructor123') {
      return HttpResponse.json({
        token: 'mock-jwt-instructor-token',
        id: 2,
        email: 'instructor@lms.com',
        fullName: 'TS. Nguyễn Văn A',
        role: 'ROLE_INSTRUCTOR',
      });
    }

    if (email === 'student@lms.com' && password === 'student123') {
      return HttpResponse.json({
        token: 'mock-jwt-student-token',
        id: 3,
        email: 'student@lms.com',
        fullName: 'Trần Văn Học Viên',
        role: 'ROLE_STUDENT',
      });
    }

    if (email === 'admin@lms.com' && password === 'admin123') {
      return HttpResponse.json({
        token: 'mock-jwt-admin-token',
        id: 1,
        email: 'admin@lms.com',
        fullName: 'Quản trị viên Hệ thống',
        role: 'ROLE_ADMIN',
      });
    }

    return new HttpResponse(
      JSON.stringify({ message: 'Email hoặc mật khẩu không chính xác!' }),
      { status: 400 }
    );
  }),

  // 5. Auth: Register
  http.post('*/api/v1/auth/register', async ({ request }) => {
    const body = await request.json();
    const { email, fullName, role } = body;

    if (email === 'exists@lms.com') {
      return new HttpResponse(
        JSON.stringify({ message: 'Email đã được sử dụng!' }),
        { status: 400 }
      );
    }

    return HttpResponse.json({
      token: 'mock-jwt-registered-token',
      id: 99,
      email,
      fullName,
      role: role || 'ROLE_STUDENT',
    });
  }),

  // 5b. Auth: Get Current User (getMe)
  http.get('*/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 3,
      email: 'student@lms.com',
      fullName: 'Trần Văn Học Viên',
      role: 'ROLE_STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isActive: true,
    });
  }),

  // 5c. Courses: My teaching
  http.get('*/api/v1/courses/my-teaching', () => {
    return HttpResponse.json(mockCourses);
  }),

  // 6. Enrollments: My learning
  http.get('*/api/v1/enrollments/my-learning', () => {
    return HttpResponse.json([
      {
        id: 100,
        userId: 3,
        courseId: 1,
        course: mockCourses[0],
        progressPercent: 50.0,
        isCompleted: false,
        enrolledAt: '2026-08-20T10:00:00',
      },
    ]);
  }),

  // 7. Enroll Course
  http.post('*/api/v1/enrollments/enroll/:courseId', ({ params }) => {
    const { courseId } = params;
    return HttpResponse.json({
      id: 101,
      userId: 3,
      courseId: Number(courseId),
      course: mockCourses[0],
      progressPercent: 0.0,
      isCompleted: false,
      enrolledAt: new Date().toISOString(),
    });
  }),

  // 7b. Check Enrollment
  http.get('*/api/v1/enrollments/check/:courseId', () => {
    return HttpResponse.json({
      enrolled: true,
    });
  }),

  // 8. Quiz by course
  http.get('*/api/v1/quizzes/course/:courseId', () => {
    return HttpResponse.json([
      {
        id: 1,
        courseId: 1,
        title: 'Bài thi tổng kết kiến thức',
        passingScore: 80,
        durationMinutes: 15,
        totalQuestions: 2,
        questions: [
          {
            id: 10,
            questionText: 'Spring Boot sử dụng cổng mặc định nào?',
            point: 1,
            answers: [
              { id: 101, answerText: '8080' },
              { id: 102, answerText: '3000' },
            ],
          },
          {
            id: 20,
            questionText: 'JSX là gì trong React?',
            point: 1,
            answers: [
              { id: 201, answerText: 'Cú pháp mở rộng JavaScript' },
              { id: 202, answerText: 'Database Engine' },
            ],
          },
        ],
      },
    ]);
  }),

  // 8b. Single Quiz by ID
  http.get('*/api/v1/quizzes/:id', () => {
    return HttpResponse.json({
      id: 1,
      courseId: 1,
      title: 'Bài thi tổng kết kiến thức',
      passingScore: 80,
      durationMinutes: 15,
      totalQuestions: 2,
      questions: [
        {
          id: 10,
          questionText: 'Spring Boot sử dụng cổng mặc định nào?',
          point: 1,
          answers: [
            { id: 101, answerText: '8080' },
            { id: 102, answerText: '3000' },
          ],
        },
        {
          id: 20,
          questionText: 'JSX là gì trong React?',
          point: 1,
          answers: [
            { id: 201, answerText: 'Cú pháp mở rộng JavaScript' },
            { id: 202, answerText: 'Database Engine' },
          ],
        },
      ],
    });
  }),

  // 9. Submit Quiz
  http.post('*/api/v1/quizzes/:id/submit', () => {
    return HttpResponse.json({
      passed: true,
      score: 100,
      totalScore: 100,
      passingScore: 80,
      message: 'Chúc mừng! Bạn đã vượt qua bài Quiz.',
      certificateUrl: '/api/v1/certificates/download/CERT-12345',
      certificate: {
        id: 50,
        certificateCode: 'CERT-12345',
        pdfUrl: '/api/v1/certificates/download/CERT-12345',
      },
    });
  }),
];
