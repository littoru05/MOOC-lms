/**
 * =========================================================================
 * CẤU HÌNH DỮ LIỆU MEGA MENU DANH MỤC KHÓA HỌC (3 TẦNG)
 * =========================================================================
 * Đường dẫn file: src/data/categoryMenu.js
 * 
 * Cấu trúc:
 * 1. Main Category (Danh mục chính) -> Hiển thị ở Cột 1 (Trái)
 * 2. Subcategory (Danh mục con)     -> Hiển thị ở Cột 2 (Giữa) khi hover mục Cột 1
 * 3. Popular Topics (Chủ đề hot)    -> Hiển thị ở Cột 3 (Phải) khi hover mục Cột 2
 * 
 * Bạn có thể dễ dàng thêm / sửa / xóa các danh mục và chủ đề tại file này.
 */

export const MEGA_MENU_CATEGORIES = [
  {
    id: 'web-dev',
    name: 'Lập trình Web',
    slug: 'lap-trinh-web',
    iconName: 'Globe', // Code / Globe / Layout
    badge: 'Phổ biến',
    subcategories: [
      {
        id: 'web-basics',
        name: 'Kiến thức căn bản Web',
        slug: 'kien-thuc-can-ban-web',
        topics: [
          { id: 'html5-css3', name: 'HTML5 & CSS3 Responsive', slug: 'html5-css3' },
          { id: 'javascript-es6', name: 'JavaScript ES6+ Toàn diện', slug: 'javascript-es6' },
          { id: 'dom-api', name: 'DOM Manipulation & Web API', slug: 'dom-api' },
          { id: 'git-github', name: 'Git & GitHub cho Developer', slug: 'git-github' }
        ]
      },
      {
        id: 'reactjs-frontend',
        name: 'ReactJS & Frontend Frameworks',
        slug: 'reactjs-frontend',
        topics: [
          { id: 'react-hooks', name: 'React Hooks & Context API', slug: 'react-hooks' },
          { id: 'redux-toolkit', name: 'Redux Toolkit & Zustand', slug: 'redux-toolkit' },
          { id: 'nextjs-app-router', name: 'Next.js 14 / 15 App Router', slug: 'nextjs' },
          { id: 'typescript-react', name: 'TypeScript với React 19', slug: 'typescript-react' },
          { id: 'tailwind-css', name: 'Tailwind CSS & Motion UI', slug: 'tailwind-css' }
        ]
      },
      {
        id: 'nodejs-backend',
        name: 'Node.js & Backend Architecture',
        slug: 'nodejs-backend',
        topics: [
          { id: 'expressjs', name: 'Express.js & RESTful API', slug: 'expressjs' },
          { id: 'nestjs', name: 'NestJS Enterprise Framework', slug: 'nestjs' },
          { id: 'jwt-auth', name: 'Bảo mật Xác thực JWT & OAuth2', slug: 'jwt-auth' },
          { id: 'microservices-node', name: 'Microservices với Kafka & RabbitMQ', slug: 'microservices' }
        ]
      },
      {
        id: 'fullstack-dev',
        name: 'Full-stack Development',
        slug: 'full-stack-development',
        topics: [
          { id: 'spring-boot-react', name: 'Spring Boot 3 + ReactJS 19', slug: 'spring-boot-react' },
          { id: 'mern-stack', name: 'MERN Stack Thực chiến', slug: 'mern-stack' },
          { id: 'graphql-api', name: 'GraphQL & Apollo Client', slug: 'graphql' },
          { id: 'ci-cd-deploy', name: 'CI/CD & Cloud Deployment (Docker)', slug: 'ci-cd' }
        ]
      }
    ]
  },
  {
    id: 'mobile-dev',
    name: 'Lập trình Mobile',
    slug: 'lap-trinh-di-dong',
    iconName: 'Smartphone',
    badge: 'Hot',
    subcategories: [
      {
        id: 'react-native',
        name: 'React Native & Expo',
        slug: 'react-native-expo',
        topics: [
          { id: 'expo-workflow', name: 'Expo Workflow & CLI', slug: 'expo' },
          { id: 'rn-navigation', name: 'React Navigation v6', slug: 'react-navigation' },
          { id: 'rn-reanimated', name: 'React Native Reanimated 3', slug: 'react-native-reanimated' },
          { id: 'rn-offline', name: 'Offline Storage & AsyncStorage', slug: 'async-storage' }
        ]
      },
      {
        id: 'flutter-dart',
        name: 'Flutter & Dart SDK',
        slug: 'flutter-dart',
        topics: [
          { id: 'dart-core', name: 'Ngôn ngữ Dart & OOP', slug: 'dart' },
          { id: 'flutter-widgets', name: 'Stateful / Stateless Widgets', slug: 'flutter-widgets' },
          { id: 'bloc-provider', name: 'BLoC Pattern & Provider', slug: 'bloc-pattern' },
          { id: 'flutter-firebase', name: 'Tích hợp Firebase Auth & Cloud', slug: 'flutter-firebase' }
        ]
      },
      {
        id: 'native-android-ios',
        name: 'Native Android & iOS',
        slug: 'native-android-ios',
        topics: [
          { id: 'kotlin-jetpack', name: 'Kotlin & Jetpack Compose', slug: 'kotlin-jetpack' },
          { id: 'swift-swiftui', name: 'Swift & SwiftUI cho iOS', slug: 'swiftui' }
        ]
      }
    ]
  },
  {
    id: 'ai-machine-learning',
    name: 'Trí tuệ nhân tạo & Machine Learning',
    slug: 'ai-data-science',
    iconName: 'Cpu',
    badge: 'Xu hướng',
    subcategories: [
      {
        id: 'machine-learning-core',
        name: 'Machine Learning Căn bản & Nâng cao',
        slug: 'machine-learning-core',
        topics: [
          { id: 'python-numpy-pandas', name: 'Python, NumPy & Pandas', slug: 'python-data' },
          { id: 'scikit-learn', name: 'Scikit-Learn & Thuật toán ML', slug: 'scikit-learn' },
          { id: 'regression-classification', name: 'Hồi quy & Phân loại dữ liệu', slug: 'classification' }
        ]
      },
      {
        id: 'deep-learning-nlp',
        name: 'Deep Learning & Thị giác máy tính',
        slug: 'deep-learning-nlp',
        topics: [
          { id: 'pytorch-tensorflow', name: 'PyTorch & TensorFlow 2.0', slug: 'pytorch' },
          { id: 'computer-vision', name: 'Computer Vision với OpenCV & YOLO', slug: 'computer-vision' },
          { id: 'nlp-transformers', name: 'NLP & HuggingFace Transformers', slug: 'nlp-transformers' }
        ]
      },
      {
        id: 'generative-ai',
        name: 'Generative AI & LLMs',
        slug: 'generative-ai',
        topics: [
          { id: 'langchain-rag', name: 'LangChain & RAG Architecture', slug: 'langchain' },
          { id: 'prompt-engineering', name: 'Prompt Engineering Chuyên sâu', slug: 'prompt-engineering' },
          { id: 'openai-gemini-api', name: 'Tích hợp OpenAI / Gemini API', slug: 'llm-api' }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    name: 'Khoa học dữ liệu & Phân tích',
    slug: 'khoa-hoc-du-lieu',
    iconName: 'BarChart3',
    subcategories: [
      {
        id: 'data-analysis',
        name: 'Phân tích dữ liệu kinh doanh (BI)',
        slug: 'data-analysis-bi',
        topics: [
          { id: 'power-bi', name: 'Microsoft Power BI Thực chiến', slug: 'power-bi' },
          { id: 'tableau', name: 'Trực quan hóa dữ liệu với Tableau', slug: 'tableau' },
          { id: 'excel-advanced', name: 'Advanced Excel & DAX Formula', slug: 'advanced-excel' }
        ]
      },
      {
        id: 'data-engineering',
        name: 'Data Engineering & Big Data',
        slug: 'data-engineering',
        topics: [
          { id: 'sql-analytics', name: 'SQL Nâng cao cho Data Analyst', slug: 'sql-analytics' },
          { id: 'apache-spark', name: 'Apache Spark & Hadoop', slug: 'apache-spark' },
          { id: 'etl-pipeline', name: 'Xây dựng Data Pipeline với Airflow', slug: 'data-pipeline' }
        ]
      }
    ]
  },
  {
    id: 'devops-cloud',
    name: 'DevOps & Cloud Computing',
    slug: 'devops-cloud',
    iconName: 'Cloud',
    subcategories: [
      {
        id: 'container-k8s',
        name: 'Containerization & Kubernetes',
        slug: 'container-kubernetes',
        topics: [
          { id: 'docker-fundamentals', name: 'Docker từ A-Z & Multi-stage Build', slug: 'docker' },
          { id: 'k8s-cluster', name: 'Kubernetes (K8s) Quản trị Cụm', slug: 'kubernetes' },
          { id: 'helm-charts', name: 'Helm Package Manager', slug: 'helm' }
        ]
      },
      {
        id: 'cloud-platforms',
        name: 'Nền tảng Đám mây (AWS / GCP / Azure)',
        slug: 'cloud-platforms',
        topics: [
          { id: 'aws-certified', name: 'AWS Solutions Architect Associate', slug: 'aws' },
          { id: 'terraform-iac', name: 'Hạ tầng dạng mã (IaC) với Terraform', slug: 'terraform' },
          { id: 'ci-cd-github-actions', name: 'CI/CD với GitHub Actions & GitLab', slug: 'github-actions' }
        ]
      }
    ]
  },
  {
    id: 'cyber-security',
    name: 'An ninh mạng & Bảo mật Web',
    slug: 'an-ninh-mang',
    iconName: 'ShieldCheck',
    subcategories: [
      {
        id: 'web-security-owasp',
        name: 'Bảo mật ứng dụng Web (OWASP)',
        slug: 'web-security-owasp',
        topics: [
          { id: 'owasp-top-10', name: 'Phòng thủ 10 lỗ hổng OWASP Top 10', slug: 'owasp-top-10' },
          { id: 'sql-injection-xss', name: 'Phòng chống SQL Injection & XSS', slug: 'sql-injection-xss' },
          { id: 'jwt-cors-csrf', name: 'Bảo mật Token JWT, CORS & CSRF', slug: 'jwt-security' }
        ]
      },
      {
        id: 'ethical-hacking',
        name: 'Kiểm thử Xâm nhập (Pentest)',
        slug: 'ethical-hacking',
        topics: [
          { id: 'kali-linux', name: 'Sử dụng Kali Linux & Nmap', slug: 'kali-linux' },
          { id: 'burp-suite', name: 'Kiểm thử bảo mật với Burp Suite', slug: 'burp-suite' },
          { id: 'ceh-preparation', name: 'Ôn luyện chứng chỉ CEH v12', slug: 'ceh' }
        ]
      }
    ]
  },
  {
    id: 'database-systems',
    name: 'Cơ sở dữ liệu & Tối ưu hóa',
    slug: 'co-so-du-lieu',
    iconName: 'Database',
    subcategories: [
      {
        id: 'relational-db',
        name: 'CSDL Quan hệ (RDBMS)',
        slug: 'rdbms',
        topics: [
          { id: 'mysql-mastery', name: 'MySQL 8.0 & Thiết kế Chuẩn hóa ERD', slug: 'mysql' },
          { id: 'postgresql', name: 'PostgreSQL & Index Optimization', slug: 'postgresql' },
          { id: 'sql-query-tuning', name: 'Tối ưu hóa câu lệnh truy vấn Query', slug: 'sql-tuning' }
        ]
      },
      {
        id: 'nosql-cache',
        name: 'NoSQL & Bộ nhớ đệm (Caching)',
        slug: 'nosql-caching',
        topics: [
          { id: 'mongodb', name: 'MongoDB cho ứng dụng Web quy mô', slug: 'mongodb' },
          { id: 'redis-caching', name: 'Redis Cache & Distributed Locks', slug: 'redis' }
        ]
      }
    ]
  },
  {
    id: 'ui-ux-design',
    name: 'Thiết kế UI/UX & Sản phẩm số',
    slug: 'thiet-ke-ui-ux',
    iconName: 'Layout',
    subcategories: [
      {
        id: 'figma-mastery',
        name: 'Figma & Design Systems',
        slug: 'figma-design-systems',
        topics: [
          { id: 'figma-autolayout', name: 'Figma Auto Layout 5.0 & Variables', slug: 'figma' },
          { id: 'design-tokens', name: 'Xây dựng Design Tokens chuẩn quốc tế', slug: 'design-tokens' },
          { id: 'figma-prototype', name: 'Interactive Prototyping & Micro-interactions', slug: 'prototype' }
        ]
      },
      {
        id: 'ux-research',
        name: 'Nghiên cứu Trải nghiệm người dùng (UX)',
        slug: 'ux-research',
        topics: [
          { id: 'user-persona', name: 'Xây dựng Persona & Empathy Map', slug: 'persona' },
          { id: 'usability-testing', name: 'Kiểm thử Usability Testing thực tế', slug: 'usability-testing' }
        ]
      }
    ]
  }
];

/**
 * Helper tìm kiếm thông tin phân cấp Breadcrumb và dữ liệu lọc từ slug hoặc tên
 */
export const findCategoryHierarchyBySlug = (query) => {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();

  // 1. Tìm trong Danh mục chính (Level 1)
  for (const cat of MEGA_MENU_CATEGORIES) {
    if (cat.slug === q || cat.id === q || cat.name.toLowerCase() === q) {
      return {
        level: 1,
        type: 'category',
        slug: cat.slug,
        title: cat.name,
        category: cat,
        breadcrumbs: [
          { name: 'Trang chủ', slug: 'home' },
          { name: cat.name, slug: cat.slug }
        ]
      };
    }

    // 2. Tìm trong Chuyên mục con (Level 2)
    for (const sub of cat.subcategories || []) {
      if (sub.slug === q || sub.id === q || sub.name.toLowerCase() === q) {
        return {
          level: 2,
          type: 'subcategory',
          slug: sub.slug,
          title: sub.name,
          category: cat,
          subcategory: sub,
          breadcrumbs: [
            { name: 'Trang chủ', slug: 'home' },
            { name: cat.name, slug: cat.slug },
            { name: sub.name, slug: sub.slug }
          ]
        };
      }

      // 3. Tìm trong Chủ đề phổ biến (Level 3)
      for (const topic of sub.topics || []) {
        if (topic.slug === q || topic.id === q || topic.name.toLowerCase() === q) {
          return {
            level: 3,
            type: 'topic',
            slug: topic.slug,
            title: topic.name,
            category: cat,
            subcategory: sub,
            topic: topic,
            breadcrumbs: [
              { name: 'Trang chủ', slug: 'home' },
              { name: cat.name, slug: cat.slug },
              { name: sub.name, slug: sub.slug },
              { name: topic.name, slug: topic.slug }
            ]
          };
        }
      }
    }
  }

  return {
    level: 1,
    type: 'search',
    slug: q,
    title: `Kết quả tìm kiếm cho "${query}"`,
    breadcrumbs: [
      { name: 'Trang chủ', slug: 'home' },
      { name: `Tìm kiếm: ${query}`, slug: q }
    ]
  };
};

