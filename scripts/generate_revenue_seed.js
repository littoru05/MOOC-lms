/**
 * Generator script to create comprehensive revenue seed data migration
 * From 2024-07-01 to END_DATE (default 2026-10-30)
 */

const fs = require('fs');
const path = require('path');

const END_DATE_STR = process.env.END_DATE || '2026-10-30';
const START_DATE_STR = '2024-07-01';

// Seedable PRNG
function Mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = Mulberry32(20261030);

// Courses data (Only PUBLISHED courses with price > 0)
const courses = [
  // Lập trình Web (Cat 1)
  { id: 1, slug: 'fullstack-spring-boot-reactjs', price: 499000, instructorId: 2, catId: 1, catName: 'Lập trình Web' },
  { id: 7, slug: 'nextjs-15-typescript-graphql-performance', price: 399000, instructorId: 2, catId: 1, catName: 'Lập trình Web' },
  { id: 12, slug: 'lap-trinh-backend-nestjs-typescript-enterprise', price: 549000, instructorId: 2, catId: 1, catName: 'Lập trình Web' },
  { id: 13, slug: 'xay-dung-restful-api-microservices-golang-grpc', price: 649000, instructorId: 2, catId: 1, catName: 'Lập trình Web' },
  { id: 14, slug: 'thiet-ke-giao-dien-web-tailwind-shadcn-framer-motion', price: 299000, instructorId: 5, catId: 1, catName: 'Lập trình Web' },

  // AI & Data Science (Cat 2)
  { id: 2, slug: 'python-machine-learning-co-ban', price: 599000, instructorId: 2, catId: 2, catName: 'Trí tuệ nhân tạo & Data Science' },
  { id: 16, slug: 'thi-giac-may-tinh-xu-ly-anh-opencv-yolov8', price: 699000, instructorId: 4, catId: 2, catName: 'Trí tuệ nhân tạo & Data Science' },
  { id: 17, slug: 'xu-ly-ngon-ngu-tu-nhien-nlp-transformer-bert-huggingface', price: 799000, instructorId: 4, catId: 2, catName: 'Trí tuệ nhân tạo & Data Science' },
  { id: 18, slug: 'ky-nghe-cau-lenh-prompt-engineering-generative-ai-doanh-nghiep', price: 349000, instructorId: 5, catId: 2, catName: 'Trí tuệ nhân tạo & Data Science' },

  // Lập trình Di động (Cat 3)
  { id: 3, slug: 'react-native-cross-platform', price: 499000, instructorId: 2, catId: 3, catName: 'Lập trình Di động' },
  { id: 20, slug: 'lap-trinh-android-hien-dai-kotlin-jetpack-compose', price: 599000, instructorId: 2, catId: 3, catName: 'Lập trình Di động' },
  { id: 21, slug: 'phat-trien-ung-dung-ios-swift-swiftui-nang-cao', price: 649000, instructorId: 2, catId: 3, catName: 'Lập trình Di động' },
  { id: 22, slug: 'thiet-ke-trai-nghiem-giao-dien-di-dong-mobile-ui-ux-app', price: 399000, instructorId: 5, catId: 3, catName: 'Lập trình Di động' },

  // DevOps & Cloud (Cat 4)
  { id: 4, slug: 'microservices-cloud-native-devops', price: 650000, instructorId: 4, catId: 4, catName: 'DevOps & Cloud Computing' },
  { id: 24, slug: 'tu-dong-hoa-ci-cd-pipeline-jenkins-gitlab-github-actions', price: 499000, instructorId: 4, catId: 4, catName: 'DevOps & Cloud Computing' },
  { id: 25, slug: 'quan-tri-ha-tang-duoi-dang-ma-terraform-ansible', price: 599000, instructorId: 4, catId: 4, catName: 'DevOps & Cloud Computing' },
  { id: 26, slug: 'luyen-thi-chung-chi-aws-certified-solutions-architect-associate', price: 799000, instructorId: 4, catId: 4, catName: 'DevOps & Cloud Computing' },

  // Thiết kế UI/UX (Cat 5)
  { id: 5, slug: 'thiet-ke-ui-ux-figma-design-system', price: 350000, instructorId: 5, catId: 5, catName: 'Thiết kế UI/UX & Sản phẩm số' },
  { id: 29, slug: 'nghien-cuu-nguoi-dung-ux-research-trai-nghiem-khach-hang', price: 399000, instructorId: 5, catId: 5, catName: 'Thiết kế UI/UX & Sản phẩm số' },
  { id: 30, slug: 'thiet-ke-micro-interactions-prototyping-protopie-figma', price: 450000, instructorId: 5, catId: 5, catName: 'Thiết kế UI/UX & Sản phẩm số' },
  { id: 31, slug: 'xay-dung-design-system-quy-mo-lon-design-tokens-doanh-nghiep', price: 599000, instructorId: 5, catId: 5, catName: 'Thiết kế UI/UX & Sản phẩm số' },
  { id: 32, slug: 'quan-tri-san-pham-so-product-management-y-tuong-ra-mat', price: 699000, instructorId: 5, catId: 5, catName: 'Thiết kế UI/UX & Sản phẩm số' },

  // An ninh mạng (Cat 6)
  { id: 6, slug: 'an-toan-thong-tin-web-security-owasp', price: 450000, instructorId: 4, catId: 6, catName: 'An ninh mạng & Bảo mật Web' },
  { id: 34, slug: 'kiem-thu-xam-nhap-penetration-testing-kali-linux-burp-suite', price: 699000, instructorId: 4, catId: 6, catName: 'An ninh mạng & Bảo mật Web' },
  { id: 35, slug: 'dieu-tra-so-digital-forensics-ung-cuu-su-co-an-ninh-mang', price: 750000, instructorId: 4, catId: 6, catName: 'An ninh mạng & Bảo mật Web' },
  { id: 37, slug: 'ky-thuat-lap-trinh-phong-thu-secure-coding-backend', price: 499000, instructorId: 2, catId: 6, catName: 'An ninh mạng & Bảo mật Web' },

  // Cơ sở dữ liệu (Cat 7)
  { id: 8, slug: 'apache-kafka-spark-big-data-streaming', price: 699000, instructorId: 4, catId: 7, catName: 'Cơ sở dữ liệu & Data Engineering' },
  { id: 39, slug: 'toi-uu-hoa-truy-van-indexing-performance-tuning-mysql', price: 499000, instructorId: 2, catId: 7, catName: 'Cơ sở dữ liệu & Data Engineering' },
  { id: 40, slug: 'thiet-ke-kho-du-lieu-hien-dai-snowflake-dbt', price: 799000, instructorId: 4, catId: 7, catName: 'Cơ sở dữ liệu & Data Engineering' },
  { id: 41, slug: 'xay-dung-data-pipeline-tu-dong-hoa-apache-airflow-python', price: 649000, instructorId: 4, catId: 7, catName: 'Cơ sở dữ liệu & Data Engineering' },
  { id: 42, slug: 'quan-tri-co-so-du-lieu-nosql-mongodb-redis', price: 450000, instructorId: 2, catId: 7, catName: 'Cơ sở dữ liệu & Data Engineering' },
];

// Student templates
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const middleNames = ['Văn', 'Thị', 'Đức', 'Hữu', 'Minh', 'Thanh', 'Ngọc', 'Quốc', 'Anh', 'Thành', 'Gia', 'Hồng', 'Mai'];
const lastNames = ['Hải', 'Tuấn', 'Dũng', 'Nam', 'Trang', 'Linh', 'Hương', 'Phúc', 'Khoa', 'Tú', 'Thắng', 'Hà', 'Phương', 'Bình', 'Huy', 'Tâm', 'Đạt'];

const students = [];
for (let i = 4; i <= 48; i++) {
  const padIndex = String(i).padStart(2, '0');
  const fn = firstNames[(i * 3) % firstNames.length];
  const mn = middleNames[(i * 5) % middleNames.length];
  const ln = lastNames[(i * 7) % lastNames.length];
  students.push({
    email: `student${padIndex}@lms.com`,
    username: `student${padIndex}`,
    fullName: `${fn} ${mn} ${ln}`,
    purchasedCourseIds: new Set(),
    createdAt: null,
  });
}

// Existing students
const existingStudents = [
  { email: 'student@lms.com', username: 'student', fullName: 'Trần Văn Học Viên', purchasedCourseIds: new Set([1, 2, 4]), createdAt: '2024-06-15 08:00:00' },
  { email: 'student2@lms.com', username: 'student2', fullName: 'Nguyễn Thị Bích Ngọc', purchasedCourseIds: new Set([3, 4, 5]), createdAt: '2024-06-15 08:00:00' },
  { email: 'student3@lms.com', username: 'student3', fullName: 'Lê Hoàng Long', purchasedCourseIds: new Set([7]), createdAt: '2024-06-15 08:00:00' },
];

const allStudents = [...existingStudents, ...students];

// Phân bổ đơn hàng theo tháng (2024-07 đến 2026-10)
const monthlyOrderTargets = {
  '2024-07': 4, '2024-08': 4, '2024-09': 5, '2024-10': 5, '2024-11': 5, '2024-12': 5,
  '2025-01': 6, '2025-02': 6, '2025-03': 7, '2025-04': 7, '2025-05': 7, '2025-06': 7,
  '2025-07': 7, '2025-08': 8, '2025-09': 8, '2025-10': 8, '2025-11': 9, '2025-12': 9,
  '2026-01': 7, '2026-02': 7, '2026-03': 8, '2026-04': 8, '2026-05': 8, '2026-06': 9,
  '2026-07': 10, '2026-08': 15, '2026-09': 18, '2026-10': 18
};

// Simulation state
const generatedOrders = [];
let orderCounter = 1;

// Course sales counter
const courseSalesCount = {};
courses.forEach(c => { courseSalesCount[c.id] = 0; });
courseSalesCount[1] = 1;
courseSalesCount[2] = 1;
courseSalesCount[3] = 1;
courseSalesCount[4] = 1;
courseSalesCount[5] = 1;
courseSalesCount[7] = 1;

function isCourseAvailable(courseId, year, month) {
  if (courseId <= 8) return true;
  if (courseId <= 25) {
    if (year > 2024) return true;
    return month >= 11;
  }
  if (year > 2025) return true;
  return month >= 3;
}

// Generate orders per month
for (const [monthKey, targetCount] of Object.entries(monthlyOrderTargets)) {
  const [yStr, mStr] = monthKey.split('-');
  const y = parseInt(yStr);
  const m = parseInt(mStr);
  const daysInMonth = new Date(y, m, 0).getDate();

  const daysUsed = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (y === 2026 && m === 10 && d > 30) continue;
    daysUsed.push(d);
  }

  for (let i = daysUsed.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [daysUsed[i], daysUsed[j]] = [daysUsed[j], daysUsed[i]];
  }

  for (let ordIdx = 0; ordIdx < targetCount; ordIdx++) {
    const day = daysUsed[ordIdx % daysUsed.length];
    const hour = 8 + Math.floor(rng() * 14); // 8:00 - 22:00
    const minute = Math.floor(rng() * 60);
    const second = Math.floor(rng() * 60);

    const padM = String(m).padStart(2, '0');
    const padD = String(day).padStart(2, '0');
    const padH = String(hour).padStart(2, '0');
    const padMin = String(minute).padStart(2, '0');
    const padSec = String(second).padStart(2, '0');

    const createdDateStr = `${y}-${padM}-${padD} ${padH}:${padMin}:${padSec}`;
    const orderDateCode = `${y}${padM}${padD}`;

    const poolSize = Math.min(allStudents.length, Math.max(8, Math.floor(((y - 2024) * 12 + m) * 1.6)));
    const studentIndex = Math.floor(rng() * poolSize);
    const student = allStudents[studentIndex];

    if (!student.createdAt) {
      const regD = Math.max(1, day - Math.floor(rng() * 5) - 1);
      const regM = regD < day ? m : Math.max(1, m - 1);
      const regY = regM <= m ? y : y - 1;
      student.createdAt = `${regY}-${String(regM).padStart(2, '0')}-${String(regD).padStart(2, '0')} 09:00:00`;
    }

    let status = 'COMPLETED';
    const statusRand = rng();
    if (y === 2026 && m === 10 && day >= 28 && ordIdx >= targetCount - 2) {
      status = 'PENDING';
    } else if (statusRand < 0.05) {
      status = 'CANCELLED';
    }

    let itemCount = 1;
    const itemRand = rng();
    if (itemRand > 0.92) itemCount = 3;
    else if (itemRand > 0.70) itemCount = 2;

    const candidateCourses = courses.filter(c => 
      isCourseAvailable(c.id, y, m) && !student.purchasedCourseIds.has(c.id)
    );

    if (candidateCourses.length === 0) continue;

    candidateCourses.sort((a, b) => {
      const salesA = courseSalesCount[a.id] || 0;
      const salesB = courseSalesCount[b.id] || 0;
      if (salesA < 3 && salesB >= 3) return -1;
      if (salesB < 3 && salesA >= 3) return 1;
      return (salesA - salesB) + (rng() - 0.5) * 4;
    });

    const chosenCourses = [];
    for (let c of candidateCourses) {
      if (chosenCourses.length >= itemCount) break;
      chosenCourses.push(c);
      if (status === 'COMPLETED') {
        student.purchasedCourseIds.add(c.id);
        courseSalesCount[c.id] = (courseSalesCount[c.id] || 0) + 1;
      }
    }

    if (chosenCourses.length === 0) continue;

    const totalAmount = chosenCourses.reduce((sum, c) => sum + c.price, 0);
    const payMethod = rng() > 0.15 ? 'QR_CODE' : 'CARD';

    let paidDateStr = null;
    if (status === 'COMPLETED') {
      const paidMin = minute + 2 + Math.floor(rng() * 8);
      const paidHour = hour + Math.floor(paidMin / 60);
      const finalMin = paidMin % 60;
      paidDateStr = `${y}-${padM}-${padD} ${String(paidHour).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}:${padSec}`;
    }

    const padSeq = String(orderCounter).padStart(3, '0');
    const orderCode = `ORD-${orderDateCode}-${padSeq}`;
    orderCounter++;

    generatedOrders.push({
      orderCode,
      studentEmail: student.email,
      totalAmount,
      status,
      paymentMethod: payMethod,
      createdAt: createdDateStr,
      paidAt: paidDateStr,
      items: chosenCourses.map(c => ({
        courseId: c.id,
        courseSlug: c.slug,
        instructorId: c.instructorId,
        catId: c.catId,
        price: c.price,
      }))
    });
  }
}

// Ensure all new students have createdAt
students.forEach((s, idx) => {
  if (!s.createdAt) {
    const monthOffset = Math.floor((idx / students.length) * 24);
    const m = (6 + monthOffset) % 12 + 1;
    const y = 2024 + Math.floor((6 + monthOffset) / 12);
    s.createdAt = `${y}-${String(m).padStart(2, '0')}-15 10:00:00`;
  }
});

// Generate SQL migration file
const sqlLines = [];
sqlLines.push('-- ====================================================================');
sqlLines.push('-- V13: Bổ sung dữ liệu seed doanh thu dày và rải đều từ 2024-07 đến 2026-10');
sqlLines.push('-- Phủ kín 3 năm lịch: 2024, 2025, 2026');
sqlLines.push('-- ====================================================================\n');
sqlLines.push('SET NAMES utf8mb4;\n');

sqlLines.push('-- 1. CẬP NHẬT NGÀY TẠO KHÓA HỌC ĐỂ ĐẢM BẢO CREATED_AT CỦA KHÓA TRƯỚC MỌI ĐƠN HÀNG');
sqlLines.push("UPDATE courses SET created_at = '2024-06-01 08:00:00' WHERE id BETWEEN 1 AND 8;");
sqlLines.push("UPDATE courses SET created_at = '2024-10-15 08:00:00' WHERE id BETWEEN 9 AND 25;");
sqlLines.push("UPDATE courses SET created_at = '2025-02-20 08:00:00' WHERE id BETWEEN 26 AND 45;\n");

sqlLines.push('-- 2. THÊM 45 HỌC VIÊN MỚI (student04 -> student48) VỚI BCRYPT CỦA student123');
sqlLines.push('INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at)');
sqlLines.push('VALUES');
const studentValues = students.map(s => 
  `  ('${s.username}', '${s.email}', '$2a$10$4oVicJ3eUeVa68DUaihxauoJ6n41HrFdRbGIWQMnKJTwMNBf3PSmu', '${s.fullName}', 'ROLE_STUDENT', 1, '${s.createdAt}')`
);
sqlLines.push(studentValues.join(',\n') + '\nON DUPLICATE KEY UPDATE id=id;\n');

sqlLines.push('-- 3. THÊM CÁC ĐƠN HÀNG MỚI (DÙNG INSERT ... SELECT TRA CỨU THEO EMAIL)');
for (const ord of generatedOrders) {
  const paidVal = ord.paidAt ? `'${ord.paidAt}'` : 'NULL';
  sqlLines.push(
    `INSERT INTO orders (order_code, user_id, total_amount, status, payment_method, created_at, paid_at) ` +
    `SELECT '${ord.orderCode}', u.id, ${ord.totalAmount}, '${ord.status}', '${ord.paymentMethod}', '${ord.createdAt}', ${paidVal} ` +
    `FROM users u WHERE u.email = '${ord.studentEmail}' AND NOT EXISTS (SELECT 1 FROM orders WHERE order_code = '${ord.orderCode}');`
  );
}
sqlLines.push('');

sqlLines.push('-- 4. THÊM CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS) THEO ORDER_CODE VÀ SLUG');
for (const ord of generatedOrders) {
  for (const item of ord.items) {
    sqlLines.push(
      `INSERT INTO order_items (order_id, course_id, price) ` +
      `SELECT o.id, c.id, ${item.price} ` +
      `FROM orders o, courses c ` +
      `WHERE o.order_code = '${ord.orderCode}' AND c.slug = '${item.courseSlug}' ` +
      `AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.course_id = c.id);`
    );
  }
}
sqlLines.push('');

sqlLines.push('-- 5. THÊM GHI DANH (ENROLLMENTS) CHO CÁC ĐƠN COMPLETED');
const completedOrders = generatedOrders.filter(o => o.status === 'COMPLETED');
for (const ord of completedOrders) {
  for (const item of ord.items) {
    sqlLines.push(
      `INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percent, is_completed) ` +
      `SELECT u.id, c.id, '${ord.paidAt}', 0.00, 0 ` +
      `FROM users u, courses c ` +
      `WHERE u.email = '${ord.studentEmail}' AND c.slug = '${item.courseSlug}' ` +
      `AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = u.id AND e.course_id = c.id);`
    );
  }
}
sqlLines.push('');
sqlLines.push('-- Đảm bảo toàn bộ order_item COMPLETED đều có enrollment tương ứng');
sqlLines.push('INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percent, is_completed)');
sqlLines.push('SELECT o.user_id, oi.course_id, COALESCE(o.paid_at, o.created_at), 0.00, 0');
sqlLines.push('FROM orders o');
sqlLines.push('JOIN order_items oi ON o.id = oi.order_id');
sqlLines.push('LEFT JOIN enrollments e ON e.user_id = o.user_id AND e.course_id = oi.course_id');
sqlLines.push('WHERE o.status = \'COMPLETED\' AND e.id IS NULL;\n');

const outFilePath = path.join(__dirname, '..', 'lms-backend', 'src', 'main', 'resources', 'db', 'migration', 'V13__expand_revenue_seed_data.sql');
fs.writeFileSync(outFilePath, sqlLines.join('\n'), 'utf8');
console.log(`Successfully generated V13 migration at: ${outFilePath}`);

// Print Detailed Summaries for the user
console.log('\n=== TỔNG KẾT THEO NĂM ===');
const yearlyStats = { 2024: { orders: 0, completed: 0, gross: 0 }, 2025: { orders: 0, completed: 0, gross: 0 }, 2026: { orders: 0, completed: 0, gross: 0 } };
const monthlyBreakdown = {};

generatedOrders.forEach(o => {
  const y = parseInt(o.createdAt.substring(0, 4));
  const m = o.createdAt.substring(0, 7);
  yearlyStats[y].orders += 1;
  if (!monthlyBreakdown[m]) monthlyBreakdown[m] = { orders: 0, completed: 0, gross: 0 };
  monthlyBreakdown[m].orders += 1;

  if (o.status === 'COMPLETED') {
    yearlyStats[y].completed += 1;
    yearlyStats[y].gross += o.totalAmount;
    monthlyBreakdown[m].completed += 1;
    monthlyBreakdown[m].gross += o.totalAmount;
  }
});

for (const [y, stat] of Object.entries(yearlyStats)) {
  console.log(`Năm ${y}: Tổng ${stat.orders} đơn (${stat.completed} COMPLETED) - Doanh thu: ${stat.gross.toLocaleString('vi-VN')} đ`);
}

console.log('\n=== TỔNG KẾT THEO TỪNG THÁNG (28 THÁNG) ===');
for (const [m, stat] of Object.entries(monthlyBreakdown)) {
  console.log(`Tháng ${m}: ${stat.orders} đơn (${stat.completed} COMPLETED) - Doanh thu: ${stat.gross.toLocaleString('vi-VN')} đ`);
}

// 90 days unique days check
const last90DaysSet = new Set();
generatedOrders.filter(o => o.status === 'COMPLETED' && o.createdAt >= '2026-08-01').forEach(o => {
  last90DaysSet.add(o.createdAt.substring(0, 10));
});
console.log(`\nSố ngày có đơn trong 90 ngày gần nhất (từ 2026-08-01 đến 2026-10-30, tổng 91 ngày): ${last90DaysSet.size} ngày (~${((last90DaysSet.size / 91) * 100).toFixed(1)}%)`);
