/**
 * SOURCE OF TRUTH (MOCK DATA DUY NHẤT) DÙNG CHUNG TOÀN ỨNG DỤNG
 * Đường dẫn: src/mocks/courses.js
 */

export const COURSES = [
  {
    id: 1,
    title: "Lập trình Web Fullstack với Spring Boot 3 & ReactJS 19",
    slug: "fullstack-spring-boot-reactjs",
    shortDescription: "Làm chủ kiến trúc Monolithic 3-Layer, Spring Security JWT, JPA Hibernate và xây dựng Single Page Application hiện đại với React 19 & Tailwind CSS.",
    fullDescription: `Khóa học được thiết kế chuyên sâu dành cho các lập trình viên muốn làm chủ toàn diện quy trình phát triển ứng dụng Web Fullstack doanh nghiệp từ con số 0 đến triển khai thực tế.

Trong phần Backend, bạn sẽ được học cách thiết kế Cơ sở dữ liệu chuẩn hóa trên MySQL 8.0, hiện thực kiến trúc Monolithic 3-Layer (Presentation - Service - Repository), xây dựng RESTful API bảo mật với Spring Security 6 và Bearer JWT, quản lý giao dịch (@Transactional) và tối ưu hóa truy vấn JPA/Hibernate.

Trong phần Frontend, bạn sẽ áp dụng ReactJS 19 kết hợp cùng Tailwind CSS để xây dựng giao diện người dùng theo chuẩn Design System hiện đại, tích hợp Axios Interceptor, quản lý trạng thái toàn cục với Context API, xây dựng trình phát bài giảng đa phương tiện và xử lý luồng thi trắc nghiệm trực tuyến tự động chấm điểm và cấp chứng chỉ số UUID.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    category: { id: 1, name: "Lập trình Web", slug: "lap-trinh-web" },
    subcategory: { id: "fullstack-dev", name: "Full-stack Development", slug: "full-stack-development" },
    tags: ["Lập trình Web", "ReactJS", "React Hooks", "Spring Boot", "Full-stack Development", "spring-boot-react", "react-hooks", "jwt-auth", "REST API", "MySQL", "Tailwind CSS"],
    level: "Trung cấp",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.9,
    reviewCount: 1420,
    students: 8650,
    enrolledCount: 8650,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "36 giờ học",
    totalSections: 4,
    totalLessons: 7,
    instructor: {
      id: 2,
      fullName: "TS. Nguyễn Văn A",
      email: "instructor@lms.com",
      title: "Senior Fullstack Architect & Giảng viên ĐH Bách Khoa",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Hơn 12 năm kinh nghiệm thiết kế kiến trúc phần mềm doanh nghiệp và đào tạo hơn 45.000 học viên.",
      totalCourses: 6,
      totalStudents: 45200,
      rating: 4.92,
    },
    whatYouWillLearn: [
      "Thiết kế CSDL quan hệ chuẩn hóa 11 thực thể trên MySQL 8.0 và tối ưu Index.",
      "Xây dựng Backend Monolithic 3-Layer chuẩn doanh nghiệp với Spring Boot 3 & Java 21.",
      "Hiện thực cơ chế bảo mật phân quyền Role-Based (RBAC) với Spring Security & JWT.",
      "Xây dựng Frontend Single Page Application với React 19, Tailwind CSS và Vite.",
      "Tích hợp luồng thi trắc nghiệm tự động chấm điểm và cấp chứng chỉ số có mã băm UUID.",
      "Đóng gói và triển khai ứng dụng đa nền tảng bằng Docker & Docker Compose."
    ],
    requirements: [
      "Kiến thức cơ bản về ngôn ngữ lập trình Java (OOP) và JavaScript cơ bản.",
      "Hiểu biết cơ bản về cơ sở dữ liệu quan hệ SQL và giao thức HTTP/REST.",
      "Máy tính cài đặt sẵn JDK 21, Node.js 18+ và Docker Desktop."
    ],
    sections: [
      {
        id: 101,
        title: "Chương 1: Tổng quan Kiến trúc & Thiết lập Môi trường",
        lessons: [
          {
            id: 1001,
            title: "1.1 Giới thiệu kiến trúc hệ thống E-Learning MOOC",
            contentType: "VIDEO",
            durationMinutes: 18,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/9SGDpanrc8U",
            notes: "Phân tích kiến trúc tổng thể của hệ thống E-Learning MOOC, mô hình phân lớp Monolithic 3-Layer (Presentation, Business Logic, Data Access)."
          },
          {
            id: 1002,
            title: "1.2 Hướng dẫn cài đặt Java 21, MySQL 8.0 & Spring Boot",
            contentType: "DOCUMENT",
            durationMinutes: 20,
            startSeconds: 0,
            contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            notes: "Tài liệu quy chuẩn môi trường phát triển: Cài đặt JDK 21 Temurin, cấu hình Maven và khởi tạo dự án Spring Boot 3 với Spring Initializr."
          },
          {
            id: 1003,
            title: "1.3 Phân tích nghiệp vụ 6 phân hệ và 11 Bảng CSDL",
            contentType: "VIDEO",
            durationMinutes: 25,
            startSeconds: 180,
            contentUrl: "https://www.youtube.com/embed/7S_tz1z_5bA",
            notes: "Lược đồ quan hệ thực thể ERD chi tiết cho 11 bảng CSDL (users, categories, courses, sections, lessons, enrollments, lesson_progress, quizzes...)."
          }
        ]
      },
      {
        id: 102,
        title: "Chương 2: Phát triển Backend 3-Layer với Spring Boot 3",
        lessons: [
          {
            id: 1004,
            title: "2.1 Định nghĩa 11 JPA Entities và thiết lập mối quan hệ",
            contentType: "VIDEO",
            durationMinutes: 30,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/31KTdfRH6nY",
            notes: "Sử dụng JPA Hibernate để ánh xạ các bảng CSDL sang Java Objects, thiết lập @OneToMany, @ManyToOne và xử lý FetchType.LAZY an toàn."
          },
          {
            id: 1005,
            title: "2.2 Cấu hình Spring Security 6 & Bộ lọc xác thực JWT",
            contentType: "VIDEO",
            durationMinutes: 40,
            startSeconds: 240,
            contentUrl: "https://www.youtube.com/embed/KxqlJblhzfI",
            notes: "Cấu hình SecurityFilterChain, Stateless Session, trích xuất Bearer Token từ Authorization Header và phân quyền theo Role."
          }
        ]
      },
      {
        id: 103,
        title: "Chương 3: Nghiệp vụ Nâng cao (Tiến độ học, Khảo thí & Chứng chỉ)",
        lessons: [
          {
            id: 1006,
            title: "3.1 Thuật toán tính % tiến độ học tập thời gian thực",
            contentType: "VIDEO",
            durationMinutes: 25,
            startSeconds: 420,
            contentUrl: "https://www.youtube.com/embed/31KTdfRH6nY",
            notes: "Thuật toán tổng hợp số bài học đã hoàn thành chia cho tổng số bài học trong khóa học để cập nhật trường progress_percent trong bảng enrollments."
          }
        ]
      },
      {
        id: 104,
        title: "Chương 4: Phát triển Frontend React 19 & Tích hợp",
        lessons: [
          {
            id: 1007,
            title: "4.1 Khởi tạo dự án Vite, Tailwind CSS & Cấu hình Theme",
            contentType: "VIDEO",
            durationMinutes: 25,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
            notes: "Thiết lập Design Tokens, hệ thống bảng màu Paper & Ink, cấu hình Tailwind CSS 3 và tổ chức cấu trúc component."
          }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        author: "Hoàng Minh Trí",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        rating: 5,
        date: "2 ngày trước",
        comment: "Khóa học cực kỳ chi tiết và bài bản! Kiến trúc Monolithic 3-Layer được giải thích rất sáng tỏ, code mẫu sạch đẹp theo chuẩn Clean Code."
      },
      {
        id: 2,
        author: "Lê Thu Hà",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        rating: 5,
        date: "1 tuần trước",
        comment: "Video bài giảng nhúng mượt mà, tài liệu PDF đính kèm rất tiện tra cứu. Phần làm đề thi Quiz tự động chấm điểm và sinh chứng chỉ UUID thật tuyệt vời!"
      }
    ]
  },
  {
    id: 2,
    title: "Trí tuệ nhân tạo & Machine Learning thực chiến với Python",
    slug: "python-machine-learning-co-ban",
    shortDescription: "Nắm vững toán học học máy, tiền xử lý dữ liệu với Pandas/NumPy và xây dựng các mô hình phân loại, hồi quy, Deep Learning với Scikit-learn & PyTorch.",
    fullDescription: `Chương trình đào tạo toàn diện về Trí tuệ nhân tạo (AI) và Khoa học Dữ liệu (Data Science) từ nền tảng đến ứng dụng thực tiễn trong doanh nghiệp.

Bạn sẽ làm chủ ngôn ngữ Python chuyên dùng cho phân tích dữ liệu, làm chủ các thư viện cốt lõi như NumPy, Pandas, Matplotlib, Seaborn để làm sạch và trực quan hóa dữ liệu. Tiếp theo là việc xây dựng các mô hình Machine Learning cổ điển (Linear Regression, Logistic Regression, Decision Tree, Random Forest, SVM) và mạng nơ-ron tích chập (CNN) cho nhận dạng hình ảnh với PyTorch.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
    category: { id: 2, name: "Trí tuệ nhân tạo & Machine Learning", slug: "ai-data-science" },
    subcategory: { id: "machine-learning-core", name: "Machine Learning Căn bản & Nâng cao", slug: "machine-learning-core" },
    tags: ["ai-data-science", "machine-learning-core", "python-data", "scikit-learn", "deep-learning", "pytorch", "classification", "regression", "Machine Learning", "Python", "Deep Learning", "PyTorch", "Trí tuệ nhân tạo"],
    level: "Cơ bản đến Nâng cao",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.88,
    reviewCount: 980,
    students: 6200,
    enrolledCount: 6200,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "42 giờ học",
    totalSections: 2,
    totalLessons: 4,
    instructor: {
      id: 2,
      fullName: "TS. Nguyễn Văn A",
      email: "instructor@lms.com",
      title: "AI Research Scientist & Giảng viên ĐH Quốc Gia",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Tiến sĩ Khoa học Máy tính, tác giả của hơn 15 bài báo khoa học quốc tế về Deep Learning và NLP.",
      totalCourses: 6,
      totalStudents: 45200,
      rating: 4.92,
    },
    whatYouWillLearn: [
      "Lập trình Python chuyên sâu cho Khoa học Dữ liệu và Xử lý Mảng NumPy.",
      "Tiền xử lý và làm sạch dữ liệu lớn bị thiếu/nhiễu với thư viện Pandas.",
      "Xây dựng và đánh giá các mô hình Phân loại (Classification) & Hồi quy (Regression).",
      "Ứng dụng Deep Learning với PyTorch để phân loại ảnh và nhận diện mẫu."
    ],
    requirements: [
      "Toán cao cấp cơ bản (Đại số tuyến tính, Xác suất thống kê cơ bản).",
      "Kinh nghiệm lập trình căn bản với bất kỳ ngôn ngữ nào."
    ],
    sections: [
      {
        id: 201,
        title: "Chương 1: Nền tảng Python & Khoa học Dữ liệu",
        lessons: [
          {
            id: 2001,
            title: "1.1 Giới thiệu hệ sinh thái AI và Python cho Data Science",
            contentType: "VIDEO",
            durationMinutes: 20,
            contentUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
            notes: "Cài đặt Anaconda, Jupyter Notebook, Google Colab và các thư viện cần thiết."
          },
          {
            id: 2002,
            title: "1.2 Thao tác mảng đa chiều hiệu năng cao với NumPy",
            contentType: "VIDEO",
            durationMinutes: 25,
            contentUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
            notes: "Các phép toán Vectorization, Broadcasting, Slicing và xử lý ma trận trên NumPy."
          }
        ]
      },
      {
        id: 202,
        title: "Chương 2: Các thuật toán Machine Learning Cốt lõi",
        lessons: [
          {
            id: 2003,
            title: "2.1 Thuật toán Hồi quy tuyến tính (Linear Regression)",
            contentType: "VIDEO",
            durationMinutes: 30,
            contentUrl: "https://www.youtube.com/embed/7eh4d6sabA0",
            notes: "Nguyên lý hàm mất mát MSE, Gradient Descent và huấn luyện mô hình dự đoán giá nhà với Scikit-learn."
          },
          {
            id: 2004,
            title: "2.2 Deep Learning với PyTorch & Neural Networks",
            contentType: "VIDEO",
            durationMinutes: 35,
            contentUrl: "https://www.youtube.com/embed/V_xro1bcAuA",
            notes: "Khởi tạo Tensors, xây dựng mô hình mạng nơ-ron đa tầng MLP và tính đạo hàm tự động Autograd."
          }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 3,
    title: "Phát triển Ứng dụng Di động Đa nền tảng với React Native & Expo",
    slug: "react-native-cross-platform",
    shortDescription: "Xây dựng ứng dụng di động iOS và Android từ một codebase duy nhất với React Native, Expo, Redux Toolkit và tích hợp REST API chuyên nghiệp.",
    fullDescription: `Khóa học đưa bạn từ con số 0 đến làm chủ kỹ năng phát triển ứng dụng di động chuyên nghiệp chạy đồng thời trên cả hai hệ điều hành iOS và Android.

Bạn sẽ làm quen với Expo Workflow hiện đại, các core components (View, Text, FlatList, ScrollView), styling với Flexbox, điều hướng đa màn hình với React Navigation, quản lý state với Redux Toolkit / Zustand và tích hợp các chức năng phần cứng (Camera, GPS, Push Notifications).`,
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    category: { id: 3, name: "Lập trình Mobile", slug: "lap-trinh-di-dong" },
    subcategory: { id: "react-native", name: "React Native & Expo", slug: "react-native-expo" },
    tags: ["lap-trinh-di-dong", "react-native-expo", "expo", "react-navigation", "react-native-reanimated", "async-storage", "React Native", "Expo", "Mobile", "iOS", "Android", "Redux Toolkit"],
    level: "Trung cấp",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.85,
    reviewCount: 650,
    students: 4100,
    enrolledCount: 4100,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "28 giờ học",
    totalSections: 2,
    totalLessons: 5,
    instructor: {
      id: 2,
      fullName: "TS. Nguyễn Văn A",
      email: "instructor@lms.com",
      title: "Mobile Lead Engineer",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "8 năm kinh nghiệm phát triển các ứng dụng mobile fintech và thương mại điện tử hàng triệu lượt tải.",
      totalCourses: 6,
      totalStudents: 45200,
      rating: 4.92,
    },
    whatYouWillLearn: [
      "Xây dựng UI/UX mượt mà trên cả 2 nền tảng iOS & Android từ một codebase duy nhất.",
      "Làm chủ hệ sinh thái Expo CLI, Debugging công cụ di động và React Native Reanimated.",
      "Tích hợp RESTful API và lưu trữ dữ liệu offline an toàn với AsyncStorage.",
      "Xây dựng luồng điều hướng Stack, Bottom Tabs với React Navigation v6."
    ],
    requirements: ["Kiến thức cơ bản về JavaScript ES6+ và React cơ bản."],
    sections: [
      {
        id: 301,
        title: "Chương 1: Thiết lập Expo & React Native Core",
        lessons: [
          {
            id: 3001,
            title: "1.1 Cài đặt Expo CLI và chạy app trên thiết bị thật",
            contentType: "VIDEO",
            durationMinutes: 20,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/0-S5a0eXPoc",
            notes: "Cài đặt ứng dụng Expo Go trên điện thoại iOS/Android, quét mã QR và chạy ứng dụng đầu tiên trong vài phút mà không cần cài đặt Xcode hay Android Studio nặng nề."
          },
          {
            id: 3002,
            title: "1.2 Sử dụng View, Text, FlatList & Flexbox Layout",
            contentType: "VIDEO",
            durationMinutes: 25,
            startSeconds: 240,
            contentUrl: "https://www.youtube.com/embed/0-S5a0eXPoc",
            notes: "Các thuộc tính Flexbox di động: flexDirection, justifyContent, alignItems và tối ưu hóa hiệu năng render danh sách sản phẩm với FlatList."
          },
          {
            id: 3003,
            title: "1.3 Xử lý tương tác người dùng với TouchableOpacity & TextInput",
            contentType: "VIDEO",
            durationMinutes: 22,
            startSeconds: 520,
            contentUrl: "https://www.youtube.com/embed/0-S5a0eXPoc",
            notes: "Thiết kế form đăng nhập, validate dữ liệu trên thiết bị di động và xử lý bàn phím ảo với KeyboardAvoidingView."
          }
        ]
      },
      {
        id: 302,
        title: "Chương 2: Điều hướng Đa màn hình & Gọi REST API",
        lessons: [
          {
            id: 3004,
            title: "2.1 Cài đặt React Navigation, Stack Navigator & Bottom Tabs",
            contentType: "VIDEO",
            durationMinutes: 30,
            startSeconds: 850,
            contentUrl: "https://www.youtube.com/embed/0-S5a0eXPoc",
            notes: "Cấu hình Navigation Container, luồng xác thực Auth Flow và truyền tham số (params) giữa các màn hình chi tiết."
          },
          {
            id: 3005,
            title: "2.2 Tích hợp Axios, quản lý trạng thái Redux Toolkit & Lưu Offline",
            contentType: "VIDEO",
            durationMinutes: 35,
            startSeconds: 1200,
            contentUrl: "https://www.youtube.com/embed/0-S5a0eXPoc",
            notes: "Kết nối ứng dụng mobile với Backend Spring Boot REST API, xử lý JWT Header và lưu token vào AsyncStorage."
          }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 4,
    title: "Chuyên sâu Microservices & Cloud Native với Docker, Kubernetes & AWS",
    slug: "microservices-cloud-native-devops",
    shortDescription: "Xây dựng kiến trúc hệ thống phân tán chịu tải cao, triển khai CI/CD tự động và giám sát hệ thống với Prometheus, Grafana trên nền tảng AWS Cloud.",
    fullDescription: `Khóa học nâng cao dành cho các kỹ sư phần mềm muốn nâng tầm lên vai trò Solution Architect và DevOps Engineer.

Nội dung bao gồm: Phân rã Monolith sang Microservices, giao tiếp đồng bộ (gRPC/REST) và bất đồng bộ (Kafka/RabbitMQ), quản lý API Gateway, bảo mật OAuth2/OpenID Connect, đóng gói Docker Container đa tầng, điều phối cụm Kubernetes (K8s) và triển khai hạ tầng đám mây AWS.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    category: { id: 4, name: "DevOps & Cloud Computing", slug: "devops-cloud" },
    subcategory: { id: "container-k8s", name: "Containerization & Kubernetes", slug: "container-kubernetes" },
    tags: ["devops-cloud", "container-kubernetes", "docker", "kubernetes", "k8s-cluster", "ci-cd-pipeline", "DevOps", "Docker", "Kubernetes", "AWS", "Microservices", "CI/CD"],
    level: "Nâng cao",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.95,
    reviewCount: 820,
    students: 3900,
    enrolledCount: 3900,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "40 giờ học",
    totalSections: 2,
    totalLessons: 4,
    instructor: {
      id: 2,
      fullName: "TS. Nguyễn Văn A",
      email: "instructor@lms.com",
      title: "Principal Cloud Architect (AWS Certified)",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Chuyên gia tư vấn chuyển đổi số và kiến trúc điện toán đám mây cho các ngân hàng và tổ chức tài chính.",
      totalCourses: 6,
      totalStudents: 45200,
      rating: 4.92,
    },
    whatYouWillLearn: [
      "Thiết kế kiến trúc Microservices phân tán có khả năng mở rộng hàng triệu request.",
      "Xây dựng hạ tầng Container với Docker và Kubernetes Cluster.",
      "Tự động hóa quy trình CI/CD và giám sát hệ thống với Prometheus/Grafana."
    ],
    requirements: ["Đã nắm vững kiến trúc Monolithic và Backend RESTful API."],
    sections: [
      {
        id: 401,
        title: "Chương 1: Kiến trúc Microservices & Phân rã Dịch vụ",
        lessons: [
          {
            id: 4001,
            title: "1.1 So sánh Monolithic vs Microservices & Spring Cloud",
            contentType: "VIDEO",
            durationMinutes: 30,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/mSZCN4wVw0I",
            notes: "Phân tích ưu nhược điểm của kiến trúc Microservices, nguyên lý Single Responsibility và cơ chế Service Discovery với Eureka/Consul."
          },
          {
            id: 4002,
            title: "1.2 Xây dựng API Gateway & Phân quyền bảo mật tập trung",
            contentType: "VIDEO",
            durationMinutes: 28,
            startSeconds: 360,
            contentUrl: "https://www.youtube.com/embed/mSZCN4wVw0I",
            notes: "Cấu hình Spring Cloud Gateway, rate limiting, routing động và xác thực JWT tập trung tại cửa ngõ API."
          }
        ]
      },
      {
        id: 402,
        title: "Chương 2: Containerization & Điều phối Kubernetes (K8s)",
        lessons: [
          {
            id: 4003,
            title: "2.1 Đóng gói Docker Container tối ưu nhiều tầng (Multi-stage Build)",
            contentType: "VIDEO",
            durationMinutes: 32,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/3c-iBn73dDE",
            notes: "Tạo Dockerfile tối ưu kích thước image từ 500MB xuống dưới 100MB với Alpine Linux và JRE stripped."
          },
          {
            id: 4004,
            title: "2.2 Triển khai Pods, Services, Ingress và Auto-scaling trên K8s",
            contentType: "VIDEO",
            durationMinutes: 40,
            startSeconds: 400,
            contentUrl: "https://www.youtube.com/embed/3c-iBn73dDE",
            notes: "Viết manifests YAML cho Deployment, Horizontal Pod Autoscaler (HPA) và cấu hình Ingress Nginx Controller."
          }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 5,
    title: "Thiết kế UI/UX Sản phẩm Chuyên nghiệp với Figma & Design Systems",
    slug: "thiet-ke-ui-ux-figma-design-system",
    shortDescription: "Làm chủ quy trình nghiên cứu người dùng, thiết kế wireframe, prototype tương tác cao và xây dựng Design System quy chuẩn cho Web & Mobile.",
    fullDescription: `Khóa học dành cho Product Designer và Frontend Developer muốn làm chủ tư duy thiết kế trải nghiệm người dùng chuẩn quốc tế.

Bạn sẽ thực hành từ quy trình nghiên cứu người dùng (User Research), xây dựng chân dung Persona, vẽ luồng người dùng (User Flow), Wireframing đến thiết kế giao diện chi tiết High-Fidelity trong Figma bằng Auto Layout 5.0, Variables, Component Sets và tạo Prototype chuyển động mượt mà.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800",
    category: { id: 5, name: "Thiết kế UI/UX & Sản phẩm số", slug: "thiet-ke-ui-ux" },
    subcategory: { id: "figma-mastery", name: "Figma & Design Systems", slug: "figma-design-systems" },
    tags: ["thiet-ke-ui-ux", "figma-design-systems", "figma", "design-tokens", "prototype", "UI/UX", "Figma", "Design Systems", "Auto Layout"],
    level: "Cơ bản đến Trung cấp",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.91,
    reviewCount: 1100,
    students: 5800,
    enrolledCount: 5800,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "24 giờ học",
    totalSections: 2,
    totalLessons: 4,
    instructor: {
      id: 2,
      fullName: "TS. Nguyễn Văn A",
      email: "instructor@lms.com",
      title: "Head of Product Design",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "10 năm thiết kế sản phẩm số cho thị trường Mỹ và Đông Nam Á.",
      totalCourses: 6,
      totalStudents: 45200,
      rating: 4.92,
    },
    whatYouWillLearn: [
      "Làm chủ công cụ Figma từ căn bản đến tính năng nâng cao (Auto Layout, Component Variants).",
      "Xây dựng Design System đồng bộ màu sắc, typography, icon và spacing.",
      "Tạo Prototype tương tác cao phục vụ User Testing và bàn giao cho Developer."
    ],
    requirements: ["Không yêu cầu kinh nghiệm thiết kế trước đó."],
    sections: [
      {
        id: 501,
        title: "Chương 1: Nguyên lý Thiết kế Giao diện & Làm chủ Figma",
        lessons: [
          {
            id: 5001,
            title: "1.1 Bố cục thị giác, 8pt Grid & Auto Layout 5.0 trong Figma",
            contentType: "VIDEO",
            durationMinutes: 25,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8",
            notes: "Quy chuẩn hệ lưới 8pt Grid System, phân cấp thị giác (Visual Hierarchy), lý thuyết màu sắc HSL và Typography scale."
          },
          {
            id: 5002,
            title: "1.2 Xây dựng Thư viện Component & Biến số (Figma Variables)",
            contentType: "VIDEO",
            durationMinutes: 28,
            startSeconds: 300,
            contentUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8",
            notes: "Quản lý Color Tokens, Spacing Variables, Dark Mode toggle và tạo các Variant trạng thái (Default, Hover, Active, Disabled)."
          }
        ]
      },
      {
        id: 502,
        title: "Chương 2: Xây dựng Prototype & Bàn giao Handoff",
        lessons: [
          {
            id: 5003,
            title: "2.1 Thiết kế Micro-interactions & Smart Animate mượt mà",
            contentType: "VIDEO",
            durationMinutes: 24,
            startSeconds: 600,
            contentUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8",
            notes: "Kỹ thuật tạo hoạt ảnh chuyển trang, dropdown menu, modal trượt và skeleton loading animation."
          },
          {
            id: 5004,
            title: "2.2 Xuất Design Tokens và bàn giao cho Frontend Developer",
            contentType: "VIDEO",
            durationMinutes: 20,
            startSeconds: 900,
            contentUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8",
            notes: "Sử dụng Figma Dev Mode, xuất CSS Variables, Tailwind Config và tối ưu assets SVG/WebP."
          }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 6,
    title: "An toàn Thông tin & Bảo mật Ứng dụng Web (OWASP Top 10)",
    slug: "an-toan-thong-tin-web-security-owasp",
    shortDescription: "Phân tích và phòng chống các lỗ hổng bảo mật nghiêm trọng (SQL Injection, XSS, CSRF, SSRF, JWT Attacks) và bảo vệ hệ thống trước các cuộc tấn công mạng.",
    fullDescription: `Khóa học trang bị cho lập trình viên và chuyên viên bảo mật kiến thức phòng thủ vững chắc trước các cuộc tấn công an ninh mạng ngày càng tinh vi.

Bạn sẽ được thực hành trong môi trường Lab giả lập để phân tích cơ chế hoạt động của các lỗ hổng nguy hiểm theo danh mục OWASP Top 10: SQL Injection, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), Insecure Direct Object References (IDOR), Broken Authentication, và các phương thức khai thác lỗ hổng Token JWT.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
    category: { id: 6, name: "An ninh mạng & Bảo mật Web", slug: "an-ninh-mang" },
    subcategory: { id: "web-security-owasp", name: "Bảo mật ứng dụng Web (OWASP)", slug: "web-security-owasp" },
    tags: ["an-ninh-mang", "web-security-owasp", "owasp-top-10", "sql-injection-xss", "jwt-security", "pentest", "Bảo mật", "OWASP", "SQL Injection", "XSS", "JWT"],
    level: "Trung cấp đến Nâng cao",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.96,
    reviewCount: 740,
    students: 3100,
    enrolledCount: 3100,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "26 giờ học",
    totalSections: 2,
    totalLessons: 4,
    instructor: {
      id: 2,
      fullName: "TS. Nguyễn Văn A",
      email: "instructor@lms.com",
      title: "Chuyên gia An toàn Thông tin (CEH, OSCP)",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Hơn 10 năm kinh nghiệm đánh giá an ninh mạng và rà soát lỗ hổng cho các tổ chức tài chính.",
      totalCourses: 6,
      totalStudents: 45200,
      rating: 4.92,
    },
    whatYouWillLearn: [
      "Hiểu rõ cơ chế hoạt động của 10 lỗ hổng bảo mật nguy hiểm nhất theo OWASP Top 10.",
      "Khai thác thực tế và khắc phục triệt để lỗ hổng SQL Injection và XSS.",
      "Bảo mật Token JWT, CORS, CSP Headers và phân quyền an toàn."
    ],
    requirements: ["Kiến thức căn bản về lập trình Web và ngôn ngữ SQL."],
    sections: [
      {
        id: 601,
        title: "Chương 1: Tổng quan An ninh Mạng & OWASP Top 10",
        lessons: [
          {
            id: 6001,
            title: "1.1 Giới thiệu mô hình phòng thủ & Phân tích lỗ hổng SQL Injection",
            contentType: "VIDEO",
            durationMinutes: 25,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/2_lswM1S264",
            notes: "Nguyên nhân lỗ hổng SQL Injection, cách hacker trích xuất dữ liệu và cách phòng chống triệt để bằng Parameterized Queries."
          },
          {
            id: 6002,
            title: "1.2 Lỗ hổng Cross-Site Scripting (XSS) & Kỹ thuật Sanitization",
            contentType: "VIDEO",
            durationMinutes: 28,
            startSeconds: 300,
            contentUrl: "https://www.youtube.com/embed/2_lswM1S264",
            notes: "Phân biệt Stored XSS, Reflected XSS, DOM XSS và cấu hình Content Security Policy (CSP) headers."
          }
        ]
      },
      {
        id: 602,
        title: "Chương 2: Bảo mật API & Hệ thống Xác thực JWT",
        lessons: [
          {
            id: 6003,
            title: "2.1 Các hình thức tấn công Token JWT & Kỹ thuật lưu trữ an toàn",
            contentType: "VIDEO",
            durationMinutes: 30,
            startSeconds: 600,
            contentUrl: "https://www.youtube.com/embed/2_lswM1S264",
            notes: "Tấn công thuật toán None, rò rỉ Secret Key, cấu hình HttpOnly Cookie và cơ chế xoay vòng Refresh Token."
          },
          {
            id: 6004,
            title: "2.2 Kiểm thử thâm nhập (Penetration Testing) cơ bản với OWASP ZAP",
            contentType: "VIDEO",
            durationMinutes: 35,
            startSeconds: 900,
            contentUrl: "https://www.youtube.com/embed/2_lswM1S264",
            notes: "Sử dụng công cụ quét tự động OWASP ZAP để phát hiện các lỗ hổng rò rỉ thông tin và cấu hình sai bảo mật."
          }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 7,
    title: "Xây dựng Ứng dụng Web Hiệu năng Cao với Next.js 15, TypeScript & GraphQL",
    slug: "nextjs-15-typescript-graphql-performance",
    shortDescription: "Tối ưu hóa Server-Side Rendering (SSR), Server Components, SEO nâng cao và quản lý dữ liệu linh hoạt với Apollo GraphQL.",
    fullDescription: `Khóa học nâng cao dành cho Frontend và Fullstack Engineers muốn đưa trải nghiệm Web lên tầm cao mới với Next.js 15.

Bạn sẽ làm quen với kiến trúc React Server Components (RSC), tối ưu hóa Core Web Vitals, Streaming SSR với Suspense, cấu hình Incremental Static Regeneration (ISR), tích hợp GraphQL Client và triển khai CDN Edge trên Vercel / AWS.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    category: { id: 1, name: "Lập trình Web", slug: "lap-trinh-web" },
    subcategory: { id: "reactjs-frontend", name: "ReactJS & Frontend Frameworks", slug: "reactjs-frontend" },
    tags: ["lap-trinh-web", "reactjs-frontend", "nextjs", "typescript-react", "react-hooks", "graphql", "Lập trình Web", "ReactJS", "Next.js", "TypeScript", "GraphQL", "SSR"],
    level: "Nâng cao",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.93,
    reviewCount: 520,
    students: 2800,
    enrolledCount: 2800,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "28 giờ học",
    totalSections: 2,
    totalLessons: 4,
    instructor: {
      id: 2,
      fullName: "TS. Nguyễn Văn A",
      email: "instructor@lms.com",
      title: "Senior Fullstack Architect",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Hơn 12 năm kinh nghiệm thiết kế kiến trúc phần mềm doanh nghiệp.",
      totalCourses: 6,
      totalStudents: 45200,
      rating: 4.92,
    },
    whatYouWillLearn: [
      "Làm chủ Next.js 15 App Router, Server Actions và Server Components.",
      "Tối ưu hóa tốc độ tải trang Core Web Vitals đạt điểm 100/100 Lighthouse.",
      "Tích hợp GraphQL API với Apollo Client và TypeScript Type-Safety."
    ],
    requirements: ["Đã thành thạo React căn bản và JavaScript ES6+."],
    sections: [
      {
        id: 701,
        title: "Chương 1: Kiến trúc Next.js 15 & Server Components",
        lessons: [
          {
            id: 7001,
            title: "1.1 Giới thiệu App Router & Rendering Strategies (SSR, SSG, ISR)",
            contentType: "VIDEO",
            durationMinutes: 25,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
            notes: "So sánh Server Components và Client Components trong React 19."
          },
          {
            id: 7002,
            title: "1.2 Xử lý dữ liệu với Server Actions & Data Caching",
            contentType: "VIDEO",
            durationMinutes: 30,
            startSeconds: 320,
            contentUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
            notes: "Cơ chế Fetch Cache, Revalidation và xử lý Mutation không cần REST endpoint."
          }
        ]
      },
      {
        id: 702,
        title: "Chương 2: Tích hợp GraphQL & Triển khai Production",
        lessons: [
          {
            id: 7003,
            title: "2.1 Cấu hình Apollo Client & Schema Codegen",
            contentType: "VIDEO",
            durationMinutes: 35,
            startSeconds: 650,
            contentUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
            notes: "Tự động sinh TypeScript Types từ GraphQL Queries."
          }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 8,
    title: "Xây dựng Hệ thống Xử lý Dữ liệu Lớn với Apache Kafka & Spark",
    slug: "apache-kafka-spark-big-data-streaming",
    shortDescription: "Thu thập, xử lý dòng sự kiện thời gian thực (Real-time Stream Processing) và phân tích Big Data quy mô petabyte.",
    fullDescription: `Khóa học chuyên sâu trang bị kiến trúc Data Pipeline hiện đại cho Data Engineers và Backend Developers.

Nội dung gồm: Cơ chế hoạt động của Distributed Commit Log trong Apache Kafka, quản lý Consumer Groups, Partitioning, Kafka Streams, tích hợp Apache Spark Streaming và lưu trữ vào Data Lakehouse.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    category: { id: 2, name: "Trí tuệ nhân tạo & Machine Learning", slug: "ai-data-science" },
    subcategory: { id: "data-engineering", name: "Data Engineering & Big Data", slug: "data-engineering" },
    tags: ["ai-data-science", "data-engineering", "apache-kafka", "spark-streaming", "data-pipeline", "Big Data", "Kafka", "Spark", "Data Engineering", "Real-time"],
    level: "Nâng cao",
    language: "Tiếng Việt",
    status: "PUBLISHED",
    rating: 4.97,
    reviewCount: 410,
    students: 2150,
    enrolledCount: 2150,
    updatedAt: "Tháng 8, 2026",
    totalDuration: "32 giờ học",
    totalSections: 2,
    totalLessons: 4,
    instructor: {
      id: 3,
      fullName: "PGS.TS. Lê Hoàng Nam",
      email: "nam.le@lms.com",
      title: "Principal Big Data Architect",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      bio: "Chuyên gia dữ liệu lớn với hơn 14 năm kinh nghiệm tư vấn giải pháp ngân hàng.",
      totalCourses: 3,
      totalStudents: 38400,
      rating: 4.96,
    },
    whatYouWillLearn: [
      "Thiết kế Event-Driven Architecture chịu tải hàng triệu tin nhắn mỗi giây.",
      "Xây dựng Real-time Data Streaming Pipeline với Kafka & Spark.",
      "Giám sát cụm phân tán và tối ưu hóa Consumer Lag."
    ],
    requirements: ["Đã nắm vững lập trình Java/Scala hoặc Python."],
    sections: [
      {
        id: 801,
        title: "Chương 1: Kiến trúc Apache Kafka & Event Streaming",
        lessons: [
          {
            id: 8001,
            title: "1.1 Tổng quan Kafka Brokers, Topics & Partition Replication",
            contentType: "VIDEO",
            durationMinutes: 30,
            startSeconds: 0,
            contentUrl: "https://www.youtube.com/embed/mSZCN4wVw0I",
            notes: "Cơ chế ghi tuần tự Disk I/O và Zero-Copy Network Transfer."
          }
        ]
      }
    ],
    reviews: []
  }
];

// 6 Featured Instructors Data
export const FEATURED_INSTRUCTORS = [
  {
    id: 1,
    fullName: "TS. Nguyễn Văn A",
    title: "Senior Fullstack Architect",
    teachingField: "Lập trình Web & Spring Boot",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    totalCourses: 4,
    totalStudents: 45200,
    rating: 4.92,
    bio: "Hơn 12 năm kinh nghiệm kiến trúc phần mềm doanh nghiệp và đào tạo hơn 45.000 học viên."
  },
  {
    id: 2,
    fullName: "PGS.TS. Lê Hoàng Nam",
    title: "AI Research Lead & Data Specialist",
    teachingField: "Trí tuệ nhân tạo & Machine Learning",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    totalCourses: 3,
    totalStudents: 38400,
    rating: 4.96,
    bio: "Tác giả của hơn 20 công bố quốc tế về Deep Learning và xử lý dữ liệu lớn thời gian thực."
  },
  {
    id: 3,
    fullName: "ThS. Trần Thị Mai",
    title: "Mobile Lead Engineer",
    teachingField: "Lập trình Di động (React Native & Flutter)",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    totalCourses: 2,
    totalStudents: 29500,
    rating: 4.88,
    bio: "8 năm dẫn dắt phát triển các ứng dụng mobile thương mại điện tử hàng triệu lượt tải."
  },
  {
    id: 4,
    fullName: "Kỹ sư Phạm Quốc Bảo",
    title: "Principal Cloud & DevOps Architect",
    teachingField: "DevOps, Docker & Kubernetes (AWS Certified)",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    totalCourses: 3,
    totalStudents: 24100,
    rating: 4.94,
    bio: "Chuyên gia chuyển đổi hạ tầng đám mây cho các ngân hàng và tập đoàn tài chính."
  },
  {
    id: 5,
    fullName: "ThS. Vũ Hoàng Yến",
    title: "Head of Product Design",
    teachingField: "Thiết kế UI/UX & Design Systems",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
    totalCourses: 2,
    totalStudents: 32000,
    rating: 4.91,
    bio: "10 năm kiến tạo ngôn ngữ thiết kế sản phẩm số cho thị trường Đông Nam Á và Mỹ."
  },
  {
    id: 6,
    fullName: "TS. Đỗ Minh Khang",
    title: "Chuyên gia An toàn Thông tin (CISSP, CEH)",
    teachingField: "An ninh mạng & Bảo mật Web OWASP",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
    totalCourses: 2,
    totalStudents: 18900,
    rating: 4.95,
    bio: "Đánh giá an ninh mạng và rà soát lỗ hổng cho các hệ thống thanh toán quốc gia."
  }
];

// Popular Categories for Carousel
export const POPULAR_CATEGORIES = [
  { id: 1, name: "Lập trình Web & Fullstack", slug: "lap-trinh-web", iconName: "Globe", coursesCount: 4, badge: "Phổ biến" },
  { id: 2, name: "Trí tuệ nhân tạo & Machine Learning", slug: "ai-data-science", iconName: "Cpu", coursesCount: 3, badge: "Hot" },
  { id: 3, name: "Lập trình Di động (React Native)", slug: "lap-trinh-di-dong", iconName: "Smartphone", coursesCount: 2, badge: "Xu hướng" },
  { id: 4, name: "DevOps & Cloud Computing", slug: "devops-cloud", iconName: "Cloud", coursesCount: 2, badge: "Nhu cầu cao" },
  { id: 5, name: "Thiết kế UI/UX & Figma", slug: "thiet-ke-ui-ux", iconName: "Layout", coursesCount: 2, badge: "Sáng tạo" },
  { id: 6, name: "An ninh mạng & Web Security", slug: "an-ninh-mang", iconName: "ShieldCheck", coursesCount: 2, badge: "Thiết yếu" },
  { id: 7, name: "Cơ sở dữ liệu & Tối ưu SQL", slug: "co-so-du-lieu", iconName: "Database", coursesCount: 2, badge: "Cốt lõi" },
  { id: 8, name: "Khoa học Dữ liệu & Power BI", slug: "khoa-hoc-du-lieu", iconName: "BarChart3", coursesCount: 2, badge: "Thực chiến" }
];

// Alias export to maintain backward compatibility
export const SAMPLE_COURSES = COURSES;

/**
 * Helper tìm kiếm khóa học theo ID hoặc Slug (so khớp chính xác không phân biệt kiểu dữ liệu)
 */
export const getCourseBySlugOrId = (slugOrId) => {
  if (!slugOrId) return COURSES[0];
  const query = String(slugOrId).trim().toLowerCase();
  
  const found = COURSES.find(
    (c) => String(c.slug).toLowerCase() === query || String(c.id) === query
  );
  
  return found || null;
};

// ==========================================
// QUIZ GLOBAL STORE & SYNCHRONIZATION
// ==========================================
const DEFAULT_QUIZZES = [
  {
    id: 1,
    courseId: 1,
    courseTitle: "Lập trình Web Fullstack với Spring Boot 3 & ReactJS 19",
    title: "Bài kiểm tra Đánh giá Năng lực Cuối khóa Fullstack",
    durationMinutes: 15,
    passScore: 80,
    passingScore: 80,
    createdAt: "2026-08-20",
    questionsCount: 5,
    questions: [
      {
        id: 101,
        content: "Trong kiến trúc Monolithic 3-Layer, tầng Service chịu trách nhiệm chính về điều gì?",
        points: 20,
        options: [
          { id: 1, content: "Chứa toàn bộ Business Logic và quản lý Giao dịch (@Transactional)" },
          { id: 2, content: "Xử lý tương tác trực tiếp với giao thức HTTP và trả về ResponseEntity" },
          { id: 3, content: "Định nghĩa câu lệnh SQL native và ánh xạ trực tiếp vào Database" },
          { id: 4, content: "Chứa giao diện người dùng ReactJS" }
        ],
        correctOptionId: 1
      },
      {
        id: 102,
        content: "Cơ chế bảo mật Stateless với JWT trong Spring Boot 3 sử dụng Authorization Header theo định dạng nào?",
        points: 20,
        options: [
          { id: 1, content: "Basic <base64-credentials>" },
          { id: 2, content: "Bearer <jwt-token-string>" },
          { id: 3, content: "Token <api-key>" },
          { id: 4, content: "Cookie: session_id=..." }
        ],
        correctOptionId: 2
      },
      {
        id: 103,
        content: "Mục đích của việc sử dụng JPA @Transactional ở mức Service method là gì?",
        points: 20,
        options: [
          { id: 1, content: "Đảm bảo tính nguyên tố ACID, tự động Rollback khi có RuntimeException" },
          { id: 2, content: "Tăng tốc độ mạng truyền dữ liệu từ Server về Client" },
          { id: 3, content: "Chuyển đổi dữ liệu JSON thành XML" },
          { id: 4, content: "Tự động mã hóa mật khẩu người dùng" }
        ],
        correctOptionId: 1
      },
      {
        id: 104,
        content: "Trong React 19, Hook nào được dùng để quản lý state và chia sẻ context mà không cần prop drilling?",
        points: 20,
        options: [
          { id: 1, content: "useContext" },
          { id: 2, content: "useMemo" },
          { id: 3, content: "useCallback" },
          { id: 4, content: "useRef" }
        ],
        correctOptionId: 1
      },
      {
        id: 105,
        content: "Chứng chỉ hoàn thành khóa học trong hệ thống được xác thực bằng loại mã định danh nào?",
        points: 20,
        options: [
          { id: 1, content: "Mã băm UUID ngẫu nhiên duy nhất (VD: CERT-8F2A-4E9B)" },
          { id: 2, content: "Số thứ tự ID tự tăng 1, 2, 3" },
          { id: 3, content: "Tên đăng nhập của học viên" },
          { id: 4, content: "Ngày tháng năm sinh" }
        ],
        correctOptionId: 1
      }
    ]
  },
  {
    id: 2,
    courseId: 2,
    courseTitle: "Trí tuệ nhân tạo & Machine Learning thực chiến với Python",
    title: "Khảo thí Kiến thức Machine Learning & Data Science",
    durationMinutes: 20,
    passScore: 80,
    passingScore: 80,
    createdAt: "2026-08-21",
    questionsCount: 4,
    questions: [
      {
        id: 201,
        content: "Thư viện nào trong Python được tối ưu hóa cho các phép toán đại số tuyến tính trên mảng đa chiều?",
        points: 25,
        options: [
          { id: 1, content: "NumPy" },
          { id: 2, content: "Requests" },
          { id: 3, content: "Flask" },
          { id: 4, content: "BeautifulSoup" }
        ],
        correctOptionId: 1
      },
      {
        id: 202,
        content: "Thuật toán Hồi quy tuyến tính (Linear Regression) tối ưu hóa hàm mất mát nào?",
        points: 25,
        options: [
          { id: 1, content: "Mean Squared Error (MSE)" },
          { id: 2, content: "Cross-Entropy Loss" },
          { id: 3, content: "Hinge Loss" },
          { id: 4, content: "Kullback-Leibler Divergence" }
        ],
        correctOptionId: 1
      }
    ]
  },
  {
    id: 3,
    courseId: 3,
    courseTitle: "Phát triển Ứng dụng Di động Đa nền tảng với React Native & Expo",
    title: "Đề kiểm tra Kỹ năng Lập trình React Native & Expo",
    durationMinutes: 15,
    passScore: 75,
    passingScore: 75,
    createdAt: "2026-08-22",
    questionsCount: 4,
    questions: [
      {
        id: 301,
        content: "Expo Go cho phép lập trình viên chạy thử ứng dụng di động bằng cách nào?",
        points: 25,
        options: [
          { id: 1, content: "Quét mã QR từ Metro Bundler trực tiếp trên thiết bị iOS / Android thật" },
          { id: 2, content: "Phải nạp file IPA qua App Store TestFlight" },
          { id: 3, content: "Bắt buộc cắm cáp USB và mở Android Studio" },
          { id: 4, content: "Chỉ chạy được trên trình duyệt web" }
        ],
        correctOptionId: 1
      },
      {
        id: 302,
        content: "Component nào trong React Native được khuyến nghị sử dụng để hiển thị danh sách lớn nhằm tiết kiệm bộ nhớ?",
        points: 25,
        options: [
          { id: 1, content: "FlatList (với cơ chế Virtualized List)" },
          { id: 2, content: "ScrollView với hàm map thông thường" },
          { id: 3, content: "View bọc ngoài nhiều thẻ Text" },
          { id: 4, content: "Thẻ HTML <table>" }
        ],
        correctOptionId: 1
      }
    ]
  }
];

export const getAllQuizzes = () => {
  try {
    const saved = localStorage.getItem('edumooc_quizzes_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QUIZZES;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_QUIZZES;
};

export const getQuizzesByCourseId = (courseId) => {
  const all = getAllQuizzes();
  if (!courseId) return all;
  const filtered = all.filter((q) => Number(q.courseId) === Number(courseId));
  return filtered.length > 0 ? filtered : [DEFAULT_QUIZZES[0]];
};

export const saveQuizToStore = (quizData) => {
  const all = getAllQuizzes();
  const newQuiz = {
    ...quizData,
    id: quizData.id || Date.now(),
    createdAt: new Date().toISOString().split('T')[0],
    questionsCount: quizData.questions?.length || 0,
  };
  const existingIdx = all.findIndex((q) => q.id === newQuiz.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...all];
    updated[existingIdx] = newQuiz;
  } else {
    updated = [newQuiz, ...all];
  }
  try {
    localStorage.setItem('edumooc_quizzes_store', JSON.stringify(updated));
  } catch (e) {}
  return newQuiz;
};

