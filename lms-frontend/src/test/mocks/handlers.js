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
    instructorName: 'TS. Nguyễn Văn A',
    categoryId: 1,
    categoryName: 'Lập trình Web',
    categorySlug: 'lap-trinh-web',
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
    instructorName: 'TS. Nguyễn Văn A',
    categoryId: 1,
    categoryName: 'Lập trình Web',
    categorySlug: 'lap-trinh-web',
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

export let mockCartState = {
  items: [
    {
      id: 1,
      courseId: 2,
      courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
      courseSlug: 'kien-truc-vi-dich-vu-cloud-native',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
      instructorName: 'TS. Nguyễn Văn A',
      price: 499000,
      addedAt: '2026-08-25T10:00:00',
    },
  ],
  totalPrice: 499000,
  totalItems: 1,
};

export let mockPaymentSessionState = {
  sessionToken: 'mock-session-uuid-1234',
  status: 'PENDING',
  expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
};

export let mockNotifications = [
  {
    id: 1,
    recipientId: 1,
    type: 'COURSE_SUBMITTED',
    title: 'Khóa học mới chờ phê duyệt',
    message: 'TS. Nguyễn Văn A đã gửi duyệt khóa học "Lập trình React"',
    link: '/admin/courses/approval?courseId=1',
    courseId: 1,
    actorId: 2,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    recipientId: 1,
    type: 'COURSE_DELETE_REQUESTED',
    title: 'Yêu cầu xóa khóa học',
    message: 'TS. Nguyễn Văn A yêu cầu xóa khóa học "Khóa học cũ"',
    link: '/admin/courses/approval?courseId=2',
    courseId: 2,
    actorId: 2,
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    recipientId: 1,
    type: 'LESSON_ADDED',
    title: 'Khóa học có bài giảng mới',
    message: 'TS. Nguyễn Văn A đã thêm nội dung mới cho khóa học "Lập trình React"',
    link: '/courses/lap-trinh-fullstack-web-react-spring-boot',
    courseId: 1,
    actorId: 2,
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const resetMockNotifications = () => {
  mockNotifications = [
    {
      id: 1,
      recipientId: 1,
      type: 'COURSE_SUBMITTED',
      title: 'Khóa học mới chờ phê duyệt',
      message: 'TS. Nguyễn Văn A đã gửi duyệt khóa học "Lập trình React"',
      link: '/admin/courses/approval?courseId=1',
      courseId: 1,
      actorId: 2,
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      recipientId: 1,
      type: 'COURSE_DELETE_REQUESTED',
      title: 'Yêu cầu xóa khóa học',
      message: 'TS. Nguyễn Văn A yêu cầu xóa khóa học "Khóa học cũ"',
      link: '/admin/courses/approval?courseId=2',
      courseId: 2,
      actorId: 2,
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      recipientId: 1,
      type: 'LESSON_ADDED',
      title: 'Khóa học có bài giảng mới',
      message: 'TS. Nguyễn Văn A đã thêm nội dung mới cho khóa học "Lập trình React"',
      link: '/courses/lap-trinh-fullstack-web-react-spring-boot',
      courseId: 1,
      actorId: 2,
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];
};


export let mockInstructorHistory = [
  {
    id: 1,
    actorId: 2,
    actorName: 'TS. Nguyễn Văn A',
    actorRole: 'ROLE_INSTRUCTOR',
    isCurrentActor: true,
    action: 'COURSE_CREATED',
    actionLabel: 'Tạo khóa học',
    entityType: 'COURSE',
    entityId: 1,
    entityLabel: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
    details: 'Khởi tạo khóa học mới',
    courseOwnerId: 2,
    courseOwnerName: 'TS. Nguyễn Văn A',
    createdAt: '2026-11-01T08:00:00',
    canRestore: false,
  },
  {
    id: 2,
    actorId: 2,
    actorName: 'TS. Nguyễn Văn A',
    actorRole: 'ROLE_INSTRUCTOR',
    isCurrentActor: true,
    action: 'COURSE_UPDATED',
    actionLabel: 'Chỉnh sửa khóa học',
    entityType: 'COURSE',
    entityId: 1,
    entityLabel: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
    details: 'Giá: Miễn phí → 599.000 ₫',
    courseOwnerId: 2,
    courseOwnerName: 'TS. Nguyễn Văn A',
    createdAt: '2026-11-02T10:30:00',
    canRestore: false,
  },
  {
    id: 3,
    actorId: 1,
    actorName: 'Quản trị viên',
    actorRole: 'ROLE_ADMIN',
    isCurrentActor: false,
    action: 'COURSE_APPROVED',
    actionLabel: 'Duyệt khóa học',
    entityType: 'COURSE',
    entityId: 1,
    entityLabel: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
    details: 'Phê duyệt xuất bản khóa học',
    courseOwnerId: 2,
    courseOwnerName: 'TS. Nguyễn Văn A',
    createdAt: '2026-11-03T14:00:00',
    canRestore: false,
  },
  {
    id: 4,
    actorId: 2,
    actorName: 'TS. Nguyễn Văn A',
    actorRole: 'ROLE_INSTRUCTOR',
    isCurrentActor: true,
    action: 'COURSE_DELETED',
    actionLabel: 'Khóa học đã xóa',
    entityType: 'COURSE',
    entityId: 2,
    entityLabel: 'Kiến trúc Vi dịch vụ và Cloud Native',
    details: 'Lưu trữ khóa học do đã có học viên đăng ký',
    courseOwnerId: 2,
    courseOwnerName: 'TS. Nguyễn Văn A',
    createdAt: '2026-11-04T16:00:00',
    canRestore: true,
  },
];

export const resetMockInstructorHistory = () => {
  mockInstructorHistory = [
    {
      id: 1,
      actorId: 2,
      actorName: 'TS. Nguyễn Văn A',
      actorRole: 'ROLE_INSTRUCTOR',
      isCurrentActor: true,
      action: 'COURSE_CREATED',
      actionLabel: 'Tạo khóa học',
      entityType: 'COURSE',
      entityId: 1,
      entityLabel: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
      details: 'Khởi tạo khóa học mới',
      courseOwnerId: 2,
      courseOwnerName: 'TS. Nguyễn Văn A',
      createdAt: '2026-11-01T08:00:00',
      canRestore: false,
    },
    {
      id: 2,
      actorId: 2,
      actorName: 'TS. Nguyễn Văn A',
      actorRole: 'ROLE_INSTRUCTOR',
      isCurrentActor: true,
      action: 'COURSE_UPDATED',
      actionLabel: 'Chỉnh sửa khóa học',
      entityType: 'COURSE',
      entityId: 1,
      entityLabel: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
      details: 'Giá: Miễn phí → 599.000 ₫',
      courseOwnerId: 2,
      courseOwnerName: 'TS. Nguyễn Văn A',
      createdAt: '2026-11-02T10:30:00',
      canRestore: false,
    },
    {
      id: 3,
      actorId: 1,
      actorName: 'Quản trị viên',
      actorRole: 'ROLE_ADMIN',
      isCurrentActor: false,
      action: 'COURSE_APPROVED',
      actionLabel: 'Duyệt khóa học',
      entityType: 'COURSE',
      entityId: 1,
      entityLabel: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
      details: 'Phê duyệt xuất bản khóa học',
      courseOwnerId: 2,
      courseOwnerName: 'TS. Nguyễn Văn A',
      createdAt: '2026-11-03T14:00:00',
      canRestore: false,
    },
    {
      id: 4,
      actorId: 2,
      actorName: 'TS. Nguyễn Văn A',
      actorRole: 'ROLE_INSTRUCTOR',
      isCurrentActor: true,
      action: 'COURSE_DELETED',
      actionLabel: 'Khóa học đã xóa',
      entityType: 'COURSE',
      entityId: 2,
      entityLabel: 'Kiến trúc Vi dịch vụ và Cloud Native',
      details: 'Lưu trữ khóa học do đã có học viên đăng ký',
      courseOwnerId: 2,
      courseOwnerName: 'TS. Nguyễn Văn A',
      createdAt: '2026-11-04T16:00:00',
      canRestore: true,
    },
  ];
};

export let mockAdminCertificates = [
  {
    id: 1,
    certificateCode: 'CERT-A1B2C3D4-10001',
    studentId: 3,
    studentName: 'Học viên Nguyễn Văn B',
    studentEmail: 'student.b@example.com',
    courseId: 1,
    courseTitle: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
    instructorName: 'TS. Nguyễn Văn A',
    finalScore: 95,
    totalDurationMinutes: 120,
    issuedAt: '2026-11-04T10:00:00',
    status: 'VALID',
    revokedAt: null,
    revokedByName: null,
    revokeReason: null,
    pdfUrl: '/api/v1/certificates/download/CERT-A1B2C3D4-10001',
  },
  {
    id: 2,
    certificateCode: 'CERT-E5F6G7H8-10002',
    studentId: 4,
    studentName: 'Học viên Trần Thị C',
    studentEmail: 'student.c@example.com',
    courseId: 2,
    courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
    instructorName: 'TS. Nguyễn Văn A',
    finalScore: 82,
    totalDurationMinutes: 180,
    issuedAt: '2026-11-03T14:30:00',
    status: 'REVOKED',
    revokedAt: '2026-11-04T09:00:00',
    revokedByName: 'Quản trị viên Hệ thống',
    revokeReason: 'Gian lận thi trắc nghiệm',
    pdfUrl: '/api/v1/certificates/download/CERT-E5F6G7H8-10002',
  },
];

export const resetMockAdminCertificates = () => {
  mockAdminCertificates = [
    {
      id: 1,
      certificateCode: 'CERT-A1B2C3D4-10001',
      studentId: 3,
      studentName: 'Học viên Nguyễn Văn B',
      studentEmail: 'student.b@example.com',
      courseId: 1,
      courseTitle: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
      instructorName: 'TS. Nguyễn Văn A',
      finalScore: 95,
      totalDurationMinutes: 120,
      issuedAt: '2026-11-04T10:00:00',
      status: 'VALID',
      revokedAt: null,
      revokedByName: null,
      revokeReason: null,
      pdfUrl: '/api/v1/certificates/download/CERT-A1B2C3D4-10001',
    },
    {
      id: 2,
      certificateCode: 'CERT-E5F6G7H8-10002',
      studentId: 4,
      studentName: 'Học viên Trần Thị C',
      studentEmail: 'student.c@example.com',
      courseId: 2,
      courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
      instructorName: 'TS. Nguyễn Văn A',
      finalScore: 82,
      totalDurationMinutes: 180,
      issuedAt: '2026-11-03T14:30:00',
      status: 'REVOKED',
      revokedAt: '2026-11-04T09:00:00',
      revokedByName: 'Quản trị viên Hệ thống',
      revokeReason: 'Gian lận thi trắc nghiệm',
      pdfUrl: '/api/v1/certificates/download/CERT-E5F6G7H8-10002',
    },
  ];
};

export const handlers = [
  // 1. Categories
  http.get('*/api/v1/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // 1b. Create Course (with custom category support)
  http.post('*/api/v1/courses', async ({ request }) => {
    const body = await request.json();
    let catId = body.categoryId;
    let catName = 'Lập trình Web';
    if (body.customCategoryName) {
      catId = mockCategories.length + 1;
      catName = body.customCategoryName;
      mockCategories.push({ id: catId, name: catName, slug: `cat-${catId}` });
    }
    const newCourse = {
      id: Date.now(),
      title: body.title,
      slug: body.slug,
      description: body.description,
      thumbnailUrl: body.thumbnailUrl,
      price: body.price || 0,
      status: 'DRAFT',
      categoryId: catId,
      categoryName: catName,
      instructorName: 'TS. Nguyễn Văn A',
      sections: [],
    };
    return HttpResponse.json(newCourse);
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

  // 3a. My teaching courses
  http.get('*/api/v1/courses/my-teaching', () => {
    return HttpResponse.json(mockCourses);
  }),

  // 3b. Course detail by ID
  http.get('*/api/v1/courses/:id', ({ params }) => {
    const { id } = params;
    const course = mockCourses.find((c) => String(c.id) === String(id));
    if (!course) {
      return HttpResponse.json(mockCourses[0]);
    }
    return HttpResponse.json(course);
  }),

  // 3c. Update Course by ID
  http.put('*/api/v1/courses/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const course = mockCourses.find((c) => String(c.id) === String(id)) || mockCourses[0];
    const updated = { ...course, ...body };
    return HttpResponse.json(updated);
  }),

  // 3c-del. Delete / Archive Course by ID
  http.delete('*/api/v1/courses/:id', ({ params }) => {
    const { id } = params;
    const course = mockCourses.find((c) => String(c.id) === String(id));
    const enrolled = (course && course.enrolledCount) || 0;
    if (enrolled > 0) {
      return HttpResponse.json({
        courseId: Number(id),
        status: 'ARCHIVED',
        isDeleted: false,
        isArchived: true,
        enrolledCount: enrolled,
        message: 'Khóa học đã có học viên đăng ký nên đã được chuyển sang trạng thái Lưu trữ (Ngừng kinh doanh) thay vì xóa vĩnh viễn.',
      });
    }
    return HttpResponse.json({
      courseId: Number(id),
      status: 'DRAFT',
      isDeleted: true,
      isArchived: false,
      enrolledCount: 0,
      message: 'Khóa học chưa có học viên đăng ký nên đã được xóa thành công khỏi hệ thống.',
    });
  }),

  // 3c-res. Restore / Unarchive Course by ID
  http.post('*/api/v1/courses/:id/restore', ({ params }) => {
    const { id } = params;
    const course = mockCourses.find((c) => String(c.id) === String(id)) || mockCourses[0];
    const restored = { ...course, status: 'PUBLISHED', isDeleted: false, deletedAt: null };
    return HttpResponse.json(restored);
  }),

  // 3d. Sections by Course ID
  http.get('*/api/v1/sections/course/:courseId', ({ params }) => {
    const { courseId } = params;
    const course = mockCourses.find((c) => String(c.id) === String(courseId)) || mockCourses[0];
    return HttpResponse.json(course.sections || []);
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

  // 5a.2 Auth: Refresh Token
  http.post('*/api/v1/auth/refresh', () => {
    const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user_cache') : null;
    if (storedToken || storedUser) {
      let parsedUser = {};
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : {};
      } catch (e) {
        parsedUser = {};
      }
      return HttpResponse.json({
        token: storedToken || 'mock-refreshed-token',
        id: parsedUser.id || 3,
        email: parsedUser.email || 'student@lms.com',
        fullName: parsedUser.fullName || 'Trần Văn Học Viên',
        role: parsedUser.role || 'ROLE_STUDENT',
      });
    }
    return new HttpResponse(
      JSON.stringify({ status: 401, error: 'Unauthorized', message: 'Refresh token không tồn tại' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  // 5a.3 Auth: Logout
  http.post('*/api/v1/auth/logout', () => {
    return HttpResponse.json({ message: 'Đăng xuất thành công!' });
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
      phone: '0987654321',
      dateOfBirth: '2001-05-15',
      gender: 'Nam',
    });
  }),

  // 5c. Auth: Update Profile
  http.put('*/api/v1/auth/profile', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 3,
      email: 'student@lms.com',
      role: 'ROLE_STUDENT',
      isActive: true,
      ...body,
    });
  }),

  // 5d. Auth: Change Password
  http.put('*/api/v1/auth/change-password', async ({ request }) => {
    const body = await request.json();
    if (!body.oldPassword) {
      return new HttpResponse(
        JSON.stringify({ message: 'Mật khẩu hiện tại không chính xác!' }),
        { status: 400 }
      );
    }
    return HttpResponse.json({ message: 'Đổi mật khẩu thành công!' });
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
              { id: 101, answerText: '8080', isCorrect: true },
              { id: 102, answerText: '3000', isCorrect: false },
            ],
          },
          {
            id: 20,
            questionText: 'JSX là gì trong React?',
            point: 1,
            answers: [
              { id: 201, answerText: 'Cú pháp mở rộng JavaScript', isCorrect: true },
              { id: 202, answerText: 'Database Engine', isCorrect: false },
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
  http.post('*/api/v1/quizzes/:id/submit', async ({ request }) => {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const studentAnswers = body.studentAnswers || [];
    if (studentAnswers.length === 0) {
      return HttpResponse.json({
        passed: false,
        score: 0,
        totalScore: 100,
        passingScore: 80,
        message: 'Bạn chưa đạt điểm yêu cầu (0%).',
      });
    }
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

  // 9b. Certificate by Enrollment
  http.get('*/api/v1/certificates/enrollment/:enrollmentId', ({ params }) => {
    if (params.enrollmentId === 'passed-enrollment' || params.enrollmentId === '999') {
      return HttpResponse.json({
        id: 50,
        certificateCode: 'CERT-12345',
        pdfUrl: '/api/v1/certificates/download/CERT-12345',
        finalScore: 90,
        studentName: 'Học viên Test',
        issuedAt: new Date().toISOString(),
      });
    }
    return new HttpResponse(JSON.stringify({ message: 'Chưa có chứng chỉ' }), { status: 404 });
  }),

  // 10. Create/Update Quiz
  http.post('*/api/v1/quizzes', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      ...body,
    });
  }),

  // 11. Lesson detail, update, delete
  http.get('*/api/v1/lessons/:id', ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      sectionId: 1,
      title: 'Bài 1: Giới thiệu hệ sinh thái LMS',
      contentType: 'VIDEO',
      contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      durationMinutes: 15,
      orderIndex: 1,
    });
  }),

  http.put('*/api/v1/lessons/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Number(params.id),
      sectionId: 1,
      ...body,
    });
  }),

  http.delete('*/api/v1/lessons/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // 12. Admin Users & Stats
  http.get('*/api/v1/admin/users', () => {
    return HttpResponse.json([
      {
        id: 1,
        fullName: 'Quản trị viên Hệ thống',
        email: 'admin@lms.com',
        username: 'admin',
        role: 'ROLE_ADMIN',
        isActive: true,
        createdAt: '2026-01-01T00:00:00',
      },
      {
        id: 2,
        fullName: 'TS. Nguyễn Văn A',
        email: 'instructor@lms.com',
        username: 'instructor',
        role: 'ROLE_INSTRUCTOR',
        isActive: true,
        createdAt: '2026-02-15T00:00:00',
      },
      {
        id: 3,
        fullName: 'Học viên Test',
        email: 'student@lms.com',
        username: 'student',
        role: 'ROLE_STUDENT',
        isActive: true,
        createdAt: '2026-03-10T00:00:00',
      },
    ]);
  }),

  http.patch('*/api/v1/admin/users/:id/toggle-active', () => {
    return HttpResponse.json({
      message: 'Cập nhật trạng thái thành công',
    });
  }),

  // Admin Pending Courses & Approvals
  http.get('*/api/v1/admin/courses/pending', () => {
    return HttpResponse.json([
      {
        id: 10,
        title: 'Lập trình Flutter & Dart Xây dựng App Mobile',
        slug: 'lap-trinh-flutter-dart-ecommerce-app',
        description: 'Làm chủ Flutter Framework và phát triển ứng dụng di động đa nền tảng.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800',
        status: 'PENDING',
        categoryId: 3,
        categoryName: 'Lập trình Di động',
        categorySlug: 'lap-trinh-di-dong',
        instructorId: 2,
        instructorName: 'TS. Nguyễn Văn A',
        price: 299000,
        sections: [
          {
            id: 21,
            courseId: 10,
            title: 'Nền tảng Ngôn ngữ Dart & Cấu trúc Widget',
            orderIndex: 1,
            lessons: [
              {
                id: 37,
                sectionId: 21,
                title: '1.1 Cài đặt Flutter SDK và tạo First App',
                contentType: 'VIDEO',
                contentUrl: 'https://www.youtube.com/embed/0-S5a0eXPoc',
                durationMinutes: 20,
                orderIndex: 1,
              },
            ],
          },
        ],
      },
    ]);
  }),

  http.patch('*/api/v1/admin/courses/:id/approve', ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      status: 'PUBLISHED',
      message: 'Khóa học đã được phê duyệt thành công!',
    });
  }),

  http.patch('*/api/v1/admin/courses/:id/reject', ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      status: 'REJECTED',
      message: 'Khóa học đã bị từ chối!',
    });
  }),

  http.get('*/api/v1/admin/stats', () => {
    return HttpResponse.json({
      totalUsers: 3,
      totalStudents: 1,
      totalInstructors: 1,
      totalCourses: 2,
      publishedCourses: 2,
      pendingCourses: 0,
      totalEnrollments: 42,
      completedEnrollments: 30,
      completionRate: 71.4,
    });
  }),

  // 13. File Upload
  http.post('*/api/v1/files/upload', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'image';
    let filename = 'mock-uploaded-image.png';
    if (type === 'video') filename = 'mock-uploaded-video.mp4';
    else if (type === 'document') filename = 'mock-uploaded-document.pdf';
    return HttpResponse.json({
      url: `/api/v1/files/${filename}`,
      filename,
    });
  }),

  // 14. Cart Endpoints
  http.get('*/api/v1/cart', () => {
    return HttpResponse.json(mockCartState);
  }),

  http.post('*/api/v1/cart/items', async ({ request }) => {
    const body = await request.json();
    const courseId = body.courseId || 2;
    const existing = mockCartState.items.find(i => i.courseId === courseId);
    if (!existing) {
      mockCartState.items.push({
        id: Date.now(),
        courseId: courseId,
        courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
        courseSlug: 'kien-truc-vi-dich-vu-cloud-native',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        instructorName: 'TS. Nguyễn Văn A',
        price: 499000,
        addedAt: new Date().toISOString(),
      });
      mockCartState.totalPrice += 499000;
      mockCartState.totalItems = mockCartState.items.length;
    }
    return HttpResponse.json(mockCartState);
  }),

  http.delete('*/api/v1/cart/items/:courseId', ({ params }) => {
    const { courseId } = params;
    mockCartState.items = mockCartState.items.filter(i => String(i.courseId) !== String(courseId));
    mockCartState.totalPrice = mockCartState.items.reduce((acc, item) => acc + (item.price || 0), 0);
    mockCartState.totalItems = mockCartState.items.length;
    return HttpResponse.json(mockCartState);
  }),

  // 15. Order Endpoints
  http.post('*/api/v1/orders/checkout', async ({ request }) => {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // no body
    }
    const paymentMethod = body?.paymentMethod === 'CARD' ? 'CARD' : 'QR_CODE';

    const purchasedItems = mockCartState.items.map((item, idx) => ({
      id: idx + 1,
      courseId: item.courseId,
      courseTitle: item.courseTitle,
      courseSlug: item.courseSlug,
      courseThumbnailUrl: item.thumbnailUrl,
      price: item.price,
    }));
    const total = mockCartState.totalPrice;

    // Reset cart on checkout
    mockCartState.items = [];
    mockCartState.totalPrice = 0;
    mockCartState.totalItems = 0;

    return HttpResponse.json({
      id: 1,
      orderCode: 'ORD-MOCK123456',
      totalAmount: total || 499000,
      status: 'COMPLETED',
      paymentMethod: paymentMethod,
      createdAt: '2026-09-11T08:00:00',
      paidAt: '2026-09-11T08:00:00',
      items: purchasedItems.length > 0 ? purchasedItems : [
        {
          id: 10,
          courseId: 2,
          courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
          courseSlug: 'kien-truc-vi-dich-vu-cloud-native',
          courseThumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
          price: 499000,
        },
      ],
    });
  }),

  http.get('*/api/v1/orders', () => {
    return HttpResponse.json([
      {
        id: 1,
        orderCode: 'ORD-MOCK123456',
        totalAmount: 499000,
        status: 'COMPLETED',
        paymentMethod: 'QR_CODE',
        createdAt: '2026-09-11T08:00:00',
        paidAt: '2026-09-11T08:00:00',
        items: [
          {
            id: 10,
            courseId: 2,
            courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
            courseSlug: 'kien-truc-vi-dich-vu-cloud-native',
            courseThumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
            price: 499000,
          },
        ],
      },
    ]);
  }),

  http.get('*/api/v1/orders/:id', () => {
    return HttpResponse.json({
      id: 1,
      orderCode: 'ORD-MOCK123456',
      totalAmount: 499000,
      status: 'COMPLETED',
      paymentMethod: 'MOCK_PAYMENT',
      createdAt: '2026-09-11T08:00:00',
      paidAt: '2026-09-11T08:00:00',
      items: [
        {
          id: 10,
          courseId: 2,
          courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
          courseSlug: 'kien-truc-vi-dich-vu-cloud-native',
          courseThumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
          price: 499000,
        },
      ],
    });
  }),

  // 16. Payment Session Endpoints
  http.post('*/api/v1/payment-sessions', () => {
    mockPaymentSessionState.sessionToken = 'mock-session-uuid-1234';
    if (!mockPaymentSessionState.status) {
      mockPaymentSessionState.status = 'PENDING';
    }
    mockPaymentSessionState.expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    return HttpResponse.json(mockPaymentSessionState, { status: 201 });
  }),

  http.get('*/api/v1/payment-sessions/:token/status', () => {
    return HttpResponse.json(mockPaymentSessionState);
  }),

  http.post('*/api/v1/payment-sessions/:token/confirm', () => {
    mockPaymentSessionState.status = 'CONFIRMED';
    return HttpResponse.json(mockPaymentSessionState);
  }),

  // 17. Instructor Student Progress Endpoints
  http.get('*/api/v1/instructor/courses/:courseId/progress', () => {
    return HttpResponse.json([
      {
        enrollmentId: 1,
        userId: 3,
        fullName: 'Trần Văn Học Viên',
        email: 'student@lms.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        courseId: 1,
        courseTitle: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
        enrolledAt: '2026-08-20T10:00:00',
        progressPercent: 100,
        isCompleted: true,
        completedLessonsCount: 2,
        totalLessonsCount: 2,
        quizScore: 100,
      },
    ]);
  }),

  http.get('*/api/v1/instructor/courses/progress', () => {
    return HttpResponse.json([
      {
        enrollmentId: 1,
        userId: 3,
        fullName: 'Trần Văn Học Viên',
        email: 'student@lms.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        courseId: 1,
        courseTitle: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
        enrolledAt: '2026-08-20T10:00:00',
        progressPercent: 100,
        isCompleted: true,
        completedLessonsCount: 2,
        totalLessonsCount: 2,
        quizScore: 100,
      },
    ]);
  }),

  // 18. Admin Revenue Endpoints
  http.get('*/api/v1/admin/revenue/overview', () => {
    return HttpResponse.json({
      totalGrossRevenue: 12500000,
      totalPlatformCommission: 2500000,
      totalInstructorPayout: 10000000,
      totalOrdersCount: 25,
      totalStudentsCount: 18,
      platformCommissionRate: 0.20,
    });
  }),

  http.get('*/api/v1/admin/revenue/chart', () => {
    return HttpResponse.json([
      { period: '2026-01', grossRevenue: 5000000, platformCommission: 1000000, instructorPayout: 4000000, ordersCount: 10 },
      { period: '2026-02', grossRevenue: 7500000, platformCommission: 1500000, instructorPayout: 6000000, ordersCount: 15 },
    ]);
  }),

  http.get('*/api/v1/admin/revenue/by-instructor', () => {
    return HttpResponse.json([
      {
        instructorId: 2,
        instructorName: 'TS. Nguyễn Văn A',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        totalRevenue: 8000000,
        coursesSoldCount: 18,
      },
    ]);
  }),

  http.get('*/api/v1/admin/revenue/top-courses', () => {
    return HttpResponse.json([
      {
        courseId: 1,
        title: 'Lập trình Fullstack Web hiện đại với React và Spring Boot',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        instructorName: 'TS. Nguyễn Văn A',
        totalSold: 12,
        totalRevenue: 6000000,
      },
    ]);
  }),

  http.get('*/api/v1/admin/revenue/by-category', () => {
    return HttpResponse.json([
      {
        categoryId: 1,
        categoryName: 'Lập trình Web',
        totalRevenue: 10000000,
      },
      {
        categoryId: 2,
        categoryName: 'Trí tuệ nhân tạo',
        totalRevenue: 2500000,
      },
    ]);
  }),

  http.get('*/api/v1/admin/revenue/growth/users', () => {
    return HttpResponse.json([
      { period: '2026-01', newStudentsCount: 10 },
      { period: '2026-02', newStudentsCount: 8 },
    ]);
  }),

  // 19. Course Request Delete & Admin Approvals
  http.post('*/api/v1/courses/:id/request-delete', ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      status: 'PENDING_DELETE',
      title: 'Khóa học chờ duyệt xóa',
    });
  }),

  // 20. Notifications Endpoints
  http.get('*/api/v1/notifications', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    let filtered = [...mockNotifications];
    if (unreadOnly) {
      filtered = filtered.filter((n) => !n.isRead);
    }

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    return HttpResponse.json({
      content: paginated,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size) || 0,
      unreadCount,
    });
  }),

  http.get('*/api/v1/notifications/unread-count', () => {
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
    return HttpResponse.json({
      unreadCount,
      count: unreadCount,
    });
  }),

  http.patch('*/api/v1/notifications/:id/read', ({ params }) => {
    const id = Number(params.id);
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      return HttpResponse.json(notif);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch('*/api/v1/notifications/read-all', () => {
    let count = 0;
    mockNotifications.forEach((n) => {
      if (!n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    return HttpResponse.json({ count });
  }),

  // Instructor History
  http.get('*/api/v1/instructor/history', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);
    const action = url.searchParams.get('action');
    const courseId = url.searchParams.get('courseId');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let filtered = [...mockInstructorHistory];
    if (action) {
      filtered = filtered.filter((h) => h.action === action);
    }
    if (courseId) {
      filtered = filtered.filter((h) => String(h.entityId) === String(courseId));
    }
    if (from) {
      filtered = filtered.filter((h) => h.createdAt >= from);
    }
    if (to) {
      filtered = filtered.filter((h) => h.createdAt <= to + 'T23:59:59');
    }

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      content: paginated,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size) || 1,
    });
  }),

  // Admin Certificates: Summary
  http.get('*/api/v1/admin/certificates/summary', () => {
    const total = mockAdminCertificates.length;
    const valid = mockAdminCertificates.filter((c) => c.status === 'VALID').length;
    const revoked = mockAdminCertificates.filter((c) => c.status === 'REVOKED').length;
    return HttpResponse.json({ total, valid, revoked });
  }),

  // Admin Certificates: Paginated List
  http.get('*/api/v1/admin/certificates', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);
    const q = (url.searchParams.get('q') || '').toLowerCase().trim();
    const status = url.searchParams.get('status');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let filtered = [...mockAdminCertificates];
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (from) {
      filtered = filtered.filter((c) => c.issuedAt >= from);
    }
    if (to) {
      filtered = filtered.filter((c) => c.issuedAt <= to + 'T23:59:59');
    }
    if (q) {
      filtered = filtered.filter((c) =>
        c.certificateCode.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.studentEmail.toLowerCase().includes(q) ||
        c.courseTitle.toLowerCase().includes(q)
      );
    }

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      content: paginated,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size) || 1,
      last: end >= filtered.length,
    });
  }),

  // Admin Certificates: Revoke
  http.post('*/api/v1/admin/certificates/:id/revoke', async ({ params, request }) => {
    const id = Number(params.id);
    const cert = mockAdminCertificates.find((c) => c.id === id);
    if (!cert) return new HttpResponse(null, { status: 404 });

    const body = await request.json();
    cert.status = 'REVOKED';
    cert.revokedAt = new Date().toISOString();
    cert.revokedByName = 'Quản trị viên Hệ thống';
    cert.revokeReason = body.reason || 'Lý do thu hồi';

    return HttpResponse.json(cert);
  }),

  // Admin Certificates: Reinstate
  http.post('*/api/v1/admin/certificates/:id/reinstate', ({ params }) => {
    const id = Number(params.id);
    const cert = mockAdminCertificates.find((c) => c.id === id);
    if (!cert) return new HttpResponse(null, { status: 404 });

    cert.status = 'VALID';
    cert.revokedAt = null;
    cert.revokedByName = null;
    cert.revokeReason = null;

    return HttpResponse.json(cert);
  }),

  // Admin User Detail, Reveal & Reset Password
  http.get('*/api/v1/admin/users/:id/detail', ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      username: 'student_mock',
      fullName: 'Trần Văn Học Viên',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'ROLE_STUDENT',
      isActive: true,
      createdAt: '2026-03-01T08:00:00',
      title: 'Học viên CNTT',
      bio: 'Đam mê lập trình web và AI',
      teachingField: null,
      email: 't***@g***.com',
      phone: '09******78',
      dateOfBirth: '**/**/****',
      gender: '***',
      stats: {
        enrolledCoursesCount: 3,
        completedCoursesCount: 1,
        certificatesCount: 1,
        ordersCount: 2,
        totalSpent: 499000,
      },
      recentEnrollments: [
        {
          enrollmentId: 101,
          courseId: 1,
          courseTitle: 'Lập trình NestJS Chuyên Sâu',
          enrolledAt: '2026-03-02T10:00:00',
          progressPercent: 100,
          isCompleted: true,
        },
      ],
      recentOrders: [
        {
          orderId: 201,
          orderCode: 'ORD-2026-001',
          totalAmount: 499000,
          status: 'COMPLETED',
          createdAt: '2026-03-02T09:30:00',
        },
      ],
      recentCertificates: [
        {
          certificateId: 301,
          certificateCode: 'CERT-2026-NESTJS-88',
          courseTitle: 'Lập trình NestJS Chuyên Sâu',
          issuedAt: '2026-03-10T14:00:00',
          status: 'VALID',
          finalScore: 95,
        },
      ],
      recentCourses: [],
    });
  }),

  http.post('*/api/v1/admin/users/:id/reveal', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    if (body.adminPassword === 'WrongPass') {
      return HttpResponse.json(
        { message: 'Mật khẩu quản trị viên không chính xác. Vui lòng thử lại.' },
        { status: 403 }
      );
    }
    if (body.adminPassword === 'RateLimit') {
      return HttpResponse.json(
        { message: 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau 10 phút.' },
        { status: 429 }
      );
    }
    return HttpResponse.json({
      email: 'tranvanhocvien@gmail.com',
      phone: '0912345678',
      dateOfBirth: '2000-05-15',
      gender: 'Nam',
    });
  }),

  http.post('*/api/v1/admin/users/:id/reset-password', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    if (body.adminPassword === 'WrongPass') {
      return HttpResponse.json(
        { message: 'Mật khẩu quản trị viên không chính xác. Vui lòng thử lại.' },
        { status: 403 }
      );
    }
    return HttpResponse.json({
      tempPassword: 'K8#mP9!q',
      message: 'Đã đặt lại mật khẩu tạm thời thành công.',
    });
  }),
];