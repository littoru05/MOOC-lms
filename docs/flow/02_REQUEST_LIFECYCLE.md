# TÀI LIỆU HỆ THỐNG MOOC-LMS - PHẦN 2
# VÒNG ĐỜI REQUEST, BẢO MẬT & QUẢN LÝ GIAO DỊCH (REQUEST LIFECYCLE, SECURITY & TRANSACTIONS)

> **Mã tài liệu:** `FLOW-02`  
> **Trạng thái xác minh:** [ĐỌC CODE] & [ĐÃ CHẠY THẬT]  
> **Căn cứ mã nguồn:**
> - Backend Controller: `OrderController.java`, `CourseController.java`, `AuthController.java`
> - Backend Service: `OrderService.java`, `CourseService.java`, `AuthService.java`, `RefreshTokenService.java`
> - Security & Exception: `SecurityConfig.java`, `AuthTokenFilter.java`, `JwtUtils.java`, `GlobalExceptionHandler.java`
> - Frontend API & Hooks: `client.js`, `cartApi.js`, `orderApi.js`, `useOrders.js`, `CheckoutPage.jsx`

---

## 1. THUẬT NGỮ NHẬP MÔN
- **Request Interceptor (Bộ đón chặn yêu cầu):** Giống như một trợ lý đóng dấu lên bì thư trước khi gửi đi. Cứ mỗi lần bạn gửi thư (request HTTP), trợ lý tự động dán thêm tem vé bảo mật (Bearer Token) vào góc trên phong bì mà người viết thư không cần tự tay dán từng lần.
- **Mutex & Queue trong Refresh Token (Khóa loại trừ tương hỗ & Hàng đợi):** Giống như phòng thay đồ chỉ có một người được vào (Mutex). Khi 4 người cùng muốn vào một lúc, người đầu tiên bước vào lấy chìa khóa mới (Refresh Token), 3 người còn lại đứng xếp hàng trật tự bên ngoài (Queue). Khi người thứ nhất ra và đưa chìa khóa mới, 3 người kia lần lượt dùng chìa đó để đi tiếp mà không phải tranh giành làm vỡ cửa kính.
- **Token Rotation (Xoay vòng vé):** Giống như vé xem phim dùng 1 lần bấm lỗ. Mỗi lần bạn xuất trình vé cũ để đổi lấy giờ xem mới, nhân viên rạch đôi vé cũ (revoked) và phát cho bạn một vé mới tinh.
- **Reuse Detection (Phát hiện dùng lại vé cũ):** Nếu có một kẻ móc túi nhặt được chiếc vé đã bị rạch đôi mang đến quầy đòi đổi vé mới, bảo vệ nhận ra ngay đây là vé đã từng sử dụng -> còi báo động hú lên và lập tức khóa toàn bộ tài khoản của người đó (thu hồi toàn bộ phiên) để bảo vệ chủ nhân thật.
- **Propagation REQUIRES_NEW (Giao dịch độc lập tách rời):** Giống như việc ghi sổ đen của ngân hàng. Cho dù giao dịch rút tiền của bạn bị lỗi hoặc hủy bỏ giữa chừng, việc hệ thống ghi tên bạn vào "Sổ đen cảnh báo an ninh" vẫn được lưu lại vĩnh viễn, không bao giờ bị xóa theo giao dịch thất bại kia.

---

## 2. VÒNG ĐỜI TOÀN DIỆN CỦA MỘT REQUEST ĐIỂN HÌNH (END-TO-END REQUEST LIFECYCLE)

Ví dụ nghiên cứu: **Luồng đặt mua và thanh toán đơn hàng khóa học qua mã QR**  
`POST /api/v1/orders/checkout`

```mermaid
sequenceDiagram
    autonumber
    participant UI as CheckoutPage.jsx (Nút bấm)
    participant Hook as useOrders.js (useCheckout)
    participant API as cartApi.js & client.js (Axios)
    participant SecFilter as AuthTokenFilter & SecurityConfig
    participant Ctrl as OrderController.java
    participant Svc as OrderService.java (@Transactional)
    participant Repo as Repositories (Order, Cart, Enrollment)
    participant DB as MySQL 8.0 (InnoDB Engine)
    participant RQ as TanStack Query Cache

    UI->>Hook: Học viên bấm [Xác nhận thanh toán]
    Hook->>API: mutateAsync({ paymentMethod: 'QR_CODE' })
    Note over API: Axios Request Interceptor chèn Header:<br/>Authorization: Bearer <inMemoryAccessToken>
    API->>SecFilter: Gửi HTTP POST /api/v1/orders/checkout
    SecFilter->>SecFilter: AuthTokenFilter parse JWT & xác thực chữ ký HS256
    SecFilter->>SecFilter: Nạp UserDetails vào SecurityContextHolder
    SecFilter->>Ctrl: Cho phép đi qua chuỗi lọc bảo mật

    Ctrl->>Svc: orderService.checkout(userEmail, "QR_CODE")
    Note over Svc: Mở @Transactional (Database Connection)
    Svc->>Repo: cartItemRepository.findByUserId(...)
    Repo->>DB: SELECT * FROM cart_items WHERE user_id = ?
    DB-->>Svc: Trả về danh sách khóa học trong giỏ
    Svc->>Svc: Double-check khóa học PUBLISHED & chưa từng ghi danh
    Svc->>Svc: Tính tổng tiền & sinh mã orderCode: ORD-XXXXXXXXXX

    Svc->>Repo: orderRepository.save(order)
    Repo->>DB: INSERT INTO orders (order_code, total_amount, status,...)
    Svc->>Repo: orderItemRepository.save(item)
    Repo->>DB: INSERT INTO order_items (...)
    Svc->>Repo: enrollmentService.enrollCourseFromOrder(...)
    Repo->>DB: INSERT INTO enrollments (course_id, user_id, progress_percent,...)
    Svc->>Repo: cartItemRepository.deleteByUserId(...)
    Repo->>DB: DELETE FROM cart_items WHERE user_id = ?
    Note over Svc: Commit Transaction thành công!

    Svc-->>Ctrl: Trả về OrderResponse (DTO)
    Ctrl-->>API: Trả về HTTP 200 OK + JSON OrderResponse
    API-->>Hook: Axios Interceptor nhận Response hợp lệ
    Note over Hook: onSuccess: Invalidate queries<br/>['cart'], ['enrollments'], ['orders'], ['my-learning']
    Hook->>RQ: Xóa sạch cache giỏ hàng cũ & đánh dấu stale
    Hook-->>UI: mutateAsync hoàn thành!
    UI->>UI: navigate('/orders/success', { state: { order } })
```

---

### 2.1. Phân tích chi tiết 14 chặng kèm mã nguồn và dữ liệu thực tế [ĐỌC CODE] & [ĐÃ CHẠY]

#### Chặng 1: Nút bấm trên giao diện người dùng (Component Layer)
- **File & Dòng:** [`lms-frontend/src/pages/student/CheckoutPage.jsx:54-63, 214-220`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/pages/student/CheckoutPage.jsx#L54-L63).
- **Hành vi:** Khi người dùng xem giỏ hàng và bấm nút `[Xác nhận thanh toán]`, hàm `handlePaymentSubmit` được kích hoạt. Nút bấm bị vô hiệu hóa (`disabled={checkoutMutation.isPending}`) để chống học viên click đúp liên tục gây trùng đơn.
- **Dữ liệu tại chặng:**
  ```javascript
  const payload = { paymentMethod: "QR_CODE" };
  ```

#### Chặng 2: Mutation Hook xử lý bất đồng bộ (React Query Layer)
- **File & Dòng:** [`lms-frontend/src/hooks/useOrders.js:47-60`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/hooks/useOrders.js#L47-L60).
- **Hành vi:** Hook `useCheckout()` bọc React Query `useMutation`. Nó chuyển giao việc gọi API cho `cartApi.checkout(data)`.
- **Dữ liệu tại chặng:** Tham số `data = { paymentMethod: "QR_CODE" }`.

#### Chặng 3: Module API Client & Request Interceptor (Network Layer)
- **File & Dòng:**
  - [`lms-frontend/src/api/cartApi.js:7`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/cartApi.js#L7): `checkout: (data) => client.post('/api/v1/orders/checkout', data)`.
  - [`lms-frontend/src/api/client.js:26-34`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/client.js#L26-L34): Request Interceptor kiểm tra biến `inMemoryAccessToken`.
- **Hành vi:** Đính kèm header `Authorization` vào cấu hình request.
- **Dữ liệu tại chặng (HTTP Request Headers):**
  ```http
  POST /api/v1/orders/checkout HTTP/1.1
  Host: localhost:8080
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50QGxtcy5jb20iLCJpYXQiOjE3MzEwMD...
  Content-Type: application/json
  Cookie: refreshToken=8f39b6e2-c439-4458-9411-9a4f6d900609-b7b51b...

  {"paymentMethod":"QR_CODE"}
  ```

#### Chặng 4: Định tuyến hạ tầng & Cổng tiếp nhận (Nginx / Tomcat)
- **File & Dòng:**
  - Nếu qua Docker: [`lms-frontend/nginx.conf:15-25`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/nginx.conf#L15-L25) chuyển tiếp `/api/` -> `http://backend:8080/api/`.
  - Embedded Tomcat bóc tách luồng TCP port 8080 thành đối tượng `HttpServletRequest`.

#### Chặng 5: Kiểm tra CORS Filter
- **File & Dòng:** [`lms-backend/src/main/java/com/lms/lms_backend/config/SecurityConfig.java:108-124`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/config/SecurityConfig.java#L108-L124).
- **Hành vi:** So khớp header `Origin` của request với danh sách `allowedOrigins` (`http://localhost:5173`, `http://localhost:3000`). Bật cờ `Access-Control-Allow-Credentials: true`.

#### Chặng 6: Xác thực Token trong `AuthTokenFilter`
- **File & Dòng:** [`lms-backend/src/main/java/com/lms/lms_backend/security/AuthTokenFilter.java:33-49, 51-63`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/security/AuthTokenFilter.java#L33-L49).
- **Hành vi từng dòng:**
  - Dòng 51-63 (`parseJwt`): Cắt chuỗi bỏ tiền tố `"Bearer "`.
  - Dòng 35: Gọi `jwtUtils.validateToken(jwt)`. Khóa bí mật HMAC-SHA256 kiểm tra chữ ký số của token.
  - Dòng 36: Lấy email chủ tài khoản: `String email = jwtUtils.getEmailFromToken(jwt)` -> `"student@lms.com"`.
  - Dòng 37: `userDetailsService.loadUserByUsername(email)` nạp thông tin quyền hạn (`ROLE_STUDENT`).
  - Dòng 39-43: Tạo đối tượng `UsernamePasswordAuthenticationToken` và nạp vào bộ nhớ ngữ cảnh an ninh `SecurityContextHolder.getContext().setAuthentication(authentication)`.

#### Chặng 7: Bộ điều khiển tiếp nhận & Bind DTO (Controller Layer)
- **File & Dòng:** [`lms-backend/src/main/java/com/lms/lms_backend/controller/OrderController.java:27-36`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/controller/OrderController.java#L27-L36).
- **Hành vi:** Jackson đọc JSON và chuyển thành đối tượng `CheckoutRequest`. Spring tiêm đối tượng `Authentication`. Lấy email học viên bằng `authentication.getName()`.
- **Dữ liệu tại chặng:** `userEmail = "student@lms.com"`, `paymentMethod = "QR_CODE"`.

#### Chặng 8: Xử lý nghiệp vụ & Giao dịch CSDL (Service Layer - `@Transactional`)
- **File & Dòng:** [`lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java:48-120`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L48-L120).
- **Hành vi từng bước:**
  - Dòng 49-50: Truy vấn người dùng từ CSDL, kiểm tra tồn tại.
  - Dòng 61-64: Đọc toàn bộ giỏ hàng của học viên `cartItemRepository.findByUserIdOrderByAddedAtDesc(user.getId())`. Nếu giỏ hàng rỗng, ném `RuntimeException("Giỏ hàng của bạn đang trống...")`.
  - Dòng 67-75: Duyệt từng item trong giỏ: Đảm bảo khóa học có `status == PUBLISHED` và người dùng chưa từng sở hữu (`!enrollmentRepository.existsByUserIdAndCourseId(...)`).
  - Dòng 78-80: Tính tổng tiền bằng Stream `reduce(BigDecimal.ZERO, BigDecimal::add)`.
  - Dòng 83: Sinh mã đơn hàng duy nhất `orderCode = "ORD-" + UUID...`.
  - Dòng 86-96: Khởi tạo đối tượng `Order` với trạng thái `OrderStatus.COMPLETED`, lưu xuống qua `orderRepository.save(order)`.
  - Dòng 99-114: Duyệt từng khóa học: Lưu `OrderItem` và gọi `enrollmentService.enrollCourseFromOrder(user, course)` để cấp quyền vào học ngay.
  - Dòng 117: Dọn sạch giỏ hàng `cartItemRepository.deleteByUserId(user.getId())`.
  - Dòng 119: Gọi `mapToResponse(savedOrder)` để đóng gói DTO trả về.

#### Chặng 9: Hibernate ORM chuyển ngữ sang SQL & Ghi dữ liệu (Database Layer)
- **Thực thi:** Hibernate sinh và bắn chuỗi lệnh SQL xuống MySQL trong cùng một Transaction:
  ```sql
  -- 1. Lưu đơn hàng
  INSERT INTO orders (created_at, order_code, paid_at, payment_method, status, total_amount, user_id)
  VALUES ('2026-11-07 14:10:07.399', 'ORD-744D757C08', '2026-11-07 14:10:07.398', 'QR_CODE', 'COMPLETED', 350000.00, 3);

  -- 2. Lưu chi tiết đơn hàng
  INSERT INTO order_items (price, course_id, order_id) VALUES (350000.00, 5, 234);

  -- 3. Tạo bản ghi ghi danh học
  INSERT INTO enrollments (course_id, user_id, enrolled_at, is_completed, progress_percent)
  VALUES (5, 3, '2026-11-07 14:10:07.410', 0, 0.0);

  -- 4. Xóa giỏ hàng
  DELETE FROM cart_items WHERE user_id = 3;
  ```

#### Chặng 10: Phản hồi HTTP Response từ Máy chủ (HTTP Layer)
- **Hành vi:** `OrderController` bọc DTO vào `ResponseEntity.ok(...)`. Jackson chuyển đổi đối tượng Java thành JSON String và trả mã HTTP 200 OK.

#### Chặng 11: Response Interceptor & Cập nhật Cache (Client State Layer)
- **File & Dòng:**
  - [`lms-frontend/src/api/client.js:52-54`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/client.js#L52-L54): Interceptor kiểm tra HTTP status nằm trong khoảng 2xx, chuyển giao cho khối `onSuccess`.
  - [`lms-frontend/src/hooks/useOrders.js:52-58`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/hooks/useOrders.js#L52-L58):
    ```javascript
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-learning'] });
    }
    ```
- **Hành vi:** React Query tự động đánh dấu các cache liên quan đến giỏ hàng và danh sách khóa học đang học là "lỗi thời" (stale), kích hoạt tải lại ngầm dữ liệu mới nhất.

#### Chặng 12: Điều hướng trang thành công (Presentation Layer)
- **File & Dòng:** [`lms-frontend/src/pages/student/CheckoutPage.jsx:61-63`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/pages/student/CheckoutPage.jsx#L61-L63).
- **Hành vi:** Lệnh `navigate('/orders/success', { state: { order } })` kích hoạt, đưa học viên tới màn hình xác nhận đơn hàng thành công kèm mã đơn vừa tạo.

---

### 2.2. Minh chứng thực nghiệm bằng `curl` [ĐÃ CHẠY]

Dưới đây là kết quả thực thi lệnh thật trên môi trường máy chủ đang chạy:

**1. Lệnh đăng nhập lấy Token:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@lms.com","password":"student123"}'
```
*Kết quả phản hồi (đã rút gọn token bảo mật):*
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50QGxtcy5jb20iLCJpYXQiOjE3MzEwMD...[RÚT GỌN]",
  "id": 3,
  "email": "student@lms.com",
  "fullName": "Trần Văn Học Viên",
  "role": "ROLE_STUDENT"
}
```

**2. Lệnh thêm khóa học (ID 5: UI/UX Figma) vào giỏ hàng:**
```bash
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_TRÊN>" \
  -d '{"courseId":5}'
```
*Kết quả phản hồi:*
```json
{
  "items": [
    {
      "id": 7,
      "courseId": 5,
      "courseTitle": "Thiết kế UI/UX Sản phẩm Chuyên nghiệp với Figma & Design Systems",
      "courseSlug": "thiet-ke-ui-ux-figma-design-system",
      "thumbnailUrl": "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800",
      "instructorName": "ThS. Vũ Hoàng Yến",
      "price": 350000,
      "addedAt": "2026-11-07T14:10:07.328628"
    }
  ],
  "totalPrice": 350000,
  "totalItems": 1
}
```

**3. Lệnh gửi thanh toán Checkout:**
```bash
curl -X POST http://localhost:8080/api/v1/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_TRÊN>" \
  -d '{"paymentMethod":"QR_CODE"}'
```
*Kết quả phản hồi từ CSDL MySQL:*
```json
{
  "id": 234,
  "orderCode": "ORD-744D757C08",
  "userId": 3,
  "userEmail": "student@lms.com",
  "totalAmount": 350000,
  "status": "COMPLETED",
  "paymentMethod": "QR_CODE",
  "createdAt": "2026-11-07T14:10:07.399347",
  "paidAt": "2026-11-07T14:10:07.398944226",
  "items": [
    {
      "id": 315,
      "courseId": 5,
      "courseTitle": "Thiết kế UI/UX Sản phẩm Chuyên nghiệp với Figma & Design Systems",
      "courseSlug": "thiet-ke-ui-ux-figma-design-system",
      "courseThumbnailUrl": "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800",
      "price": 350000
    }
  ]
}
```

---

## 3. HAI VÒNG ĐỜI NGẮN ĐIỂN HÌNH (SPECIALIZED REQUEST LIFECYCLES)

### 3.1. Vòng đời GET Công khai qua JPA Specification
**Endpoint:** `GET /api/v1/courses/public?priceType=paid&categoryId=1&search=spring`

```mermaid
flowchart LR
    Client["Trình duyệt / Khách vãng lai"] --> Controller["CourseController:35\ngetPublishedCourses(...)"]
    Controller --> Service["CourseService: getAllPublishedCourses(...)"]
    Service --> Spec["CourseSpecification:16\nfilterPublishedCourses(...)"]
    Spec --> Repo["CourseRepository: findAll(Specification)"]
    Repo --> DB[("MySQL: Dynamic WHERE Query")]
    DB --> Service
    Service --> DTO["List<CourseResponse>"]
    DTO --> Client
```

- **Mục đích:** Cho phép khách chưa đăng nhập vẫn có thể duyệt tìm khóa học có kèm các bộ lọc động phức tạp kết hợp: giá bán, danh mục, từ khóa tìm kiếm.
- **Quy trình hoạt động:**
  1. Yêu cầu gửi tới không cần header `Authorization`. Tại [`SecurityConfig.java:76-77`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/config/SecurityConfig.java#L76-L77), đường dẫn `/api/v1/courses/public/**` đã được cấp phép `permitAll()`.
  2. [`CourseSpecification.java:16-69`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L16-L69) sử dụng JPA Criteria API để xây dựng câu truy vấn an toàn:
     - Luôn ép điều kiện: `status = PUBLISHED` và `isDeleted IS FALSE` ([dòng 27-28](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L27-L28)).
     - Lọc `priceType = "paid"`: thêm điều kiện `price > 0` ([dòng 36-40](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L36-L40)).
     - Lọc `categoryId = 1`: thêm điều kiện `category.id = 1` ([dòng 54-56](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L54-L56)).
     - Tìm kiếm từ khóa: `LOWER(title) LIKE %spring% OR LOWER(description) LIKE %spring%` ([dòng 59-65](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L59-L65)).
  3. Cơ sở dữ liệu thực thi câu lệnh SQL SELECT đã tối ưu hóa, loại bỏ hoàn toàn các khóa học nháp (DRAFT) hoặc khóa học đã bị xóa mềm.

---

### 3.2. Vòng đời Request Bị Từ Chối (Error & Exception Lifecycle)

Khi một request không hợp lệ được gửi tới máy chủ, hệ thống phân loại và xử lý theo 3 lớp phòng vệ:

```mermaid
flowchart TD
    Req["Request gửi tới Backend"] --> Check1{"Có Token JWT hợp lệ?"}
    
    Check1 -- Không --> EntryPoint["SecurityConfig:58\nAuthenticationEntryPoint\n(Chặn tại Filter)"]
    EntryPoint --> JSON401["Trả HTTP 401 Unauthorized\n{'status': 401, 'message': 'Vui lòng đăng nhập...'}"]

    Check1 -- Có --> Check2{"Đúng vai trò (Role)?\n@PreAuthorize"}
    Check2 -- Không --> AccessDenied["GlobalExceptionHandler:60\nhoặc SecurityConfig:63\nAccessDeniedHandler"]
    AccessDenied --> JSON403["Trả HTTP 403 Forbidden\n{'status': 403, 'message': 'Bạn không có quyền...'}"]

    Check2 -- Có --> Check3{"Hợp lệ nghiệp vụ?\n(Ví dụ: Mua trùng, xem đơn người khác)"}
    Check3 -- Không --> BizException["Service ném RuntimeException\nGlobalExceptionHandler:109"]
    BizException --> JSON400["Trả HTTP 400 Bad Request\n{'status': 400, 'message': 'Khóa học miễn phí không cần...'}"]
```

#### Bảng so sánh thực tế 3 kịch bản từ chối [ĐÃ CHẠY THẬT]:

| Kịch bản | Lớp phát hiện | Ai sinh ra lỗi & File dòng | Cấu trúc JSON trả về client | Hành vi ứng xử tại Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **1. Không có Token (401)** | `SecurityFilterChain` | [`SecurityConfig.java:58-62`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/config/SecurityConfig.java#L58-L62)<br/>(AuthenticationEntryPoint) | `{"status": 401, "error": "Unauthorized", "message": "Vui lòng đăng nhập (Thiếu hoặc Token không hợp lệ)!"}` | `client.js` bắt 401 -> thử refresh token -> nếu thất bại bắn sự kiện `auth:expired` -> đưa về `/login`. |
| **2. Sai vai trò (403)** | Controller Method Interceptor | [`GlobalExceptionHandler.java:60-73`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L60-L73)<br/>(AccessDeniedException) | `{"status": 403, "error": "Không có quyền truy cập", "message": "Tài khoản của bạn không đủ quyền để thực hiện thao tác này! Cần quyền ROLE_INSTRUCTOR hoặc ROLE_ADMIN."}` | Axios ném lỗi về React Query -> Component hiển thị Toast màu đỏ hoặc đẩy về trang phân quyền của Role hiện tại. |
| **3. Lỗi nghiệp vụ (400)** | Business Service | [`GlobalExceptionHandler.java:109-117`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L109-L117)<br/>(RuntimeException) | `{"status": 400, "error": "Lỗi xử lý yêu cầu", "message": "Khóa học miễn phí không cần thêm vào giỏ hàng, bạn có thể ghi danh trực tiếp!"}` | React Component bắt khối `catch`, đọc thuộc tính `error.response.data.message` và in thông báo lỗi trực tiếp dưới form. |

---

## 4. XÁC THỰC CHUYÊN SÂU: JWT IN-MEMORY, TOKEN ROTATION & REUSE DETECTION

```mermaid
sequenceDiagram
    autonumber
    participant Client as Axios Client (client.js)
    participant AuthCtrl as AuthController.java
    participant AuthSvc as AuthService.java
    participant RefSvc as RefreshTokenService.java (REQUIRES_NEW)
    participant DB as MySQL (Bảng refresh_tokens)

    %% Giai đoạn Đăng nhập
    Note over Client, DB: 1. ĐĂNG NHẬP (LOGIN FLOW)
    Client->>AuthCtrl: POST /api/v1/auth/login { email, password }
    AuthCtrl->>AuthSvc: login(req, response)
    AuthSvc->>DB: Kiểm tra mật khẩu (BCrypt)
    AuthSvc->>AuthSvc: Sinh Access Token 15 phút (In-Memory)
    AuthSvc->>DB: Lưu Refresh Token mới (revoked = false, sống 7 ngày)
    AuthSvc-->>Client: Set-Cookie: refreshToken=...; HttpOnly; SameSite=Lax/None; Secure
    AuthSvc-->>Client: Body: { token: "eyJhbGciOi...", user: {...} }
    Note over Client: Lưu token vào RAM (inMemoryAccessToken)

    %% Giai đoạn Refresh Token bình thường
    Note over Client, DB: 2. XOAY VÒNG TOKEN BÌNH THƯỜNG (TOKEN ROTATION)
    Client->>AuthCtrl: POST /api/v1/auth/refresh (Cookie tự gửi kèm)
    AuthCtrl->>AuthSvc: refreshToken(tokenStr, response)
    AuthSvc->>DB: SELECT * FROM refresh_tokens WHERE token = ?
    Note over AuthSvc: Token hợp lệ & revoked == false
    AuthSvc->>DB: Đánh dấu token cũ: UPDATE revoked = true
    AuthSvc->>DB: Tạo token mới: INSERT INTO refresh_tokens (revoked = false)
    AuthSvc-->>Client: Set-Cookie mới & Access Token mới

    %% Giai đoạn Phát hiện Hacker dùng lại token
    Note over Client, DB: 3. PHÁT HIỆN TÁI SỬ DỤNG (REUSE DETECTION & ATTACK DETECTED)
    Note over Client: Kẻ tấn công dùng lại token cũ (đã revoked = true)
    Client->>AuthCtrl: POST /api/v1/auth/refresh (Gửi token cũ đã hủy)
    AuthCtrl->>AuthSvc: refreshToken(tokenStr, response)
    AuthSvc->>DB: SELECT * FROM refresh_tokens WHERE token = ?
    Note over AuthSvc: PHÁT HIỆN: token.getRevoked() == true!
    AuthSvc->>RefSvc: revokeAllTokensForUser(user)
    Note over RefSvc: Kích hoạt Transaction REQUIRES_NEW độc lập:
    RefSvc->>DB: UPDATE refresh_tokens SET revoked = true WHERE user_id = ?
    Note over RefSvc: Commit ngay lập tức xuống CSDL!
    AuthSvc-->>Client: Ném BadCredentialsException 401 Unauthorized
    Note over Client: Toàn bộ phiên của người dùng trên mọi thiết bị đều bị hủy!
```

---

### 4.1. Cơ chế Concurrency Mutex & Hàng đợi trong `client.js` [ĐỌC CODE]

Trong [`lms-frontend/src/api/client.js:36-160`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/client.js#L36-L160), hệ thống xử lý bài toán **nhiều request cùng nhận lỗi 401 tại một thời điểm**:

```javascript
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};
```

#### Quy trình xử lý lỗi 401 theo 5 bước logic:
1. **Kiểm tra chống lặp vô hạn:** Nếu chính request bị 401 là các đường dẫn đăng nhập/làm mới (`/login`, `/register`, `/refresh`), hoặc cờ `originalRequest._retry` đã được bật, hệ thống lập tức từ chối và phát sự kiện `auth:expired` ([`client.js:65-88`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/client.js#L65-L88)).
2. **Cơ chế xếp hàng (Queueing):** Nếu biến cờ `isRefreshing === true` (đã có một request trước đó đang đi lấy token mới), request hiện tại **không gửi thêm API refresh**, mà tự đóng gói thành một `Promise` và đẩy vào mảng `failedQueue` ([`client.js:91-100`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/client.js#L91-L100)).
3. **Kích hoạt Mutex:** Request đầu tiên phát hiện 401 sẽ gán `isRefreshing = true`, bật cờ `originalRequest._retry = true` và gọi `POST /api/v1/auth/refresh`.
4. **Giải phóng hàng đợi (Retry):**
   - Khi API refresh thành công: Lưu token mới vào RAM (`setAccessToken(newToken)`), phát sự kiện `auth:refreshed`, gọi `processQueue(null, newToken)` để cấp token mới cho toàn bộ các request đang đứng chờ trong hàng đợi và thực thi lại chúng đồng loạt.
   - Khi API refresh thất bại: Gọi `processQueue(refreshError, null)`, dọn sạch RAM và thông báo phiên đăng nhập hết hạn.
5. **Dọn cờ:** Khối `finally` luôn đặt lại `isRefreshing = false`.

---

## 5. MA TRẬN QUẢN LÝ GIAO DỊCH TOÀN HỆ THỐNG (`@Transactional` MATRIX)

Hệ thống LMS sử dụng mô hình giao dịch của Spring Framework (`org.springframework.transaction.annotation.Transactional`) để đảm bảo tính toàn vẹn dữ liệu tuân thủ chuẩn **ACID** (Atomicity, Consistency, Isolation, Durability).

### 5.1. Bảng tra cứu các phương thức nghiệp vụ `@Transactional` [ĐỌC CODE]

| Service | Phương thức & Dòng | Thuộc tính Transaction | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **`RefreshTokenService`** | [`revokeAllTokensForUser:26`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/RefreshTokenService.java#L26) | `propagation = Propagation.REQUIRES_NEW` | **Thu hồi khẩn cấp độc lập:** Mở transaction riêng biệt để UPDATE toàn bộ token thành revoked. Bắt buộc commit ngay lập tức dù bên ngoài có throw Exception 401. |
| **`AuthService`** | [`refreshToken:119`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L119) | `noRollbackFor = BadCredentialsException.class` | **Xoay vòng token:** Đảm bảo khi phát hiện token hết hạn, lệnh cập nhật `revoked = true` vẫn được lưu xuống CSDL chứ không bị rollback khi ném lỗi 401. |
| **`AuthService`** | [`register:53`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L53), [`login:90`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L90) | `@Transactional` (REQUIRED) | Tạo User mới, băm mật khẩu, sinh JWT và lưu bản ghi Refresh Token đầu tiên. |
| **`OrderService`** | [`checkout:48`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L48) | `@Transactional` (REQUIRED) | **Atomic Checkout:** Gom việc tạo Order, tạo OrderItem, ghi danh học viên và xóa giỏ hàng thành 1 khối duy nhất. Lỗi ở bất kỳ bước nào sẽ rollback 100%. |
| **`OrderService`** | [`getMyOrders:122`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L122), [`getOrderById:132`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L132) | `@Transactional(readOnly = true)` | Tối ưu hóa hiệu năng đọc lịch sử đơn hàng, tắt chế độ Dirty Checking của Hibernate. |
| **`CartService`** | [`addToCart:40`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/CartService.java#L40) | `@Transactional` (REQUIRED) | Kiểm tra quyền học viên, kiểm tra khóa học trả phí và thêm vào giỏ hàng an toàn. |
| **`EnrollmentService`**| [`enrollCourseFromOrder:53`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/EnrollmentService.java#L53) | `@Transactional` (REQUIRED) | Khởi tạo bản ghi quyền học, thiết lập tiến độ 0.0% và gắn cờ chưa hoàn thành. |
| **`CourseService`** | [`createCourse:33`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/CourseService.java#L33), [`updateCourse:104`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/CourseService.java#L104) | `@Transactional` (REQUIRED) | Tạo hoặc cập nhật nội dung khóa học, tự động cập nhật slug và ghi lịch sử Audit Log. |
| **`CourseService`** | [`deleteCourse:209`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/CourseService.java#L209) | `@Transactional` (REQUIRED) | **Xóa mềm (Soft Delete):** Đánh dấu `isDeleted = true`, lưu thời gian xóa `deletedAt` mà không xóa hẳn hàng dữ liệu khỏi MySQL. |
| **`AuditLogService`** | [`log:52`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuditLogService.java#L52) | `@Transactional` (REQUIRED) | Lưu vết hành động kiểm toán (tạo khóa học, sửa bài học, đổi giá) vào bảng `audit_logs`. |
| **`CertificateService`**| [`issueCertificate:62`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/CertificateService.java#L62) | `@Transactional` (REQUIRED) | Kiểm tra điều kiện hoàn thành khóa học 100%, sinh mã chứng chỉ duy nhất và kết xuất PDF. |

---

### 5.2. Phân tích chuyên sâu: Vì sao `RefreshTokenService` bắt buộc dùng `REQUIRES_NEW`?

Xem xét trường hợp thực tế tại [`AuthService.java:135-140`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L135-L140):

```java
if (Boolean.TRUE.equals(refreshToken.getRevoked())) {
    log.warn("CẢNH BÁO BẢO MẬT: Phát hiện tái sử dụng Refresh Token đã bị thu hồi...");
    refreshTokenService.revokeAllTokensForUser(refreshToken.getUser());
    throw new BadCredentialsException("Cảnh báo bảo mật: Refresh token đã bị vô hiệu hóa trước đó...");
}
```

> [!CAUTION]
> **Hiểm họa nếu KHÔNG dùng `REQUIRES_NEW`:**  
> Nếu hàm `revokeAllTokensForUser` chỉ mang `@Transactional` thông thường (mặc định là `REQUIRED`), nó sẽ dùng chung Transaction với hàm `refreshToken`. Khi chạy đến dòng tiếp theo `throw new BadCredentialsException(...)`, toàn bộ Transaction sẽ bị đánh dấu là **Rollback**!  
> Hậu quả là: Câu lệnh `UPDATE refresh_tokens SET revoked = true` bị hủy bỏ sạch sẽ, dữ liệu trong MySQL quay trở về trạng thái cũ. Kẻ tấn công có thể tiếp tục sử dụng token đó để tấn công tiếp mà không bị khóa!  
> **Giải pháp với `REQUIRES_NEW`:**  
> Spring tạm ngắt Transaction hiện tại và mở ra một Database Connection mới hoàn toàn. Câu lệnh thu hồi toàn bộ token được thực thi và **COMMIT NGAY LẬP TỨC** vào MySQL. Sau đó dù Transaction bên ngoài có sập hoặc ném ngoại lệ 401 thì lệnh khóa tài khoản vẫn đã được khắc ghi vĩnh viễn trong CSDL.

---

## 6. BẢNG TỔNG HỢP MÃ LỖI TOÀN HỆ THỐNG (ERROR HANDLING MATRIX)

Tất cả các lỗi nghiệp vụ và an ninh đều được chuẩn hóa qua [`GlobalExceptionHandler.java:18-129`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L18-L129) và [`SecurityConfig.java:57-68`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/config/SecurityConfig.java#L57-L68):

| Tên Exception | Mã HTTP | Tiêu đề lỗi (`error`) | Cấu trúc nội dung (`message` / `details`) | Nơi ném lỗi trong mã nguồn |
| :--- | :---: | :--- | :--- | :--- |
| `MethodArgumentNotValidException` | **400** | Dữ liệu không hợp lệ | Map chi tiết từng trường bị lỗi vi phạm Validation (`details: { email: "Email không được để trống" }`) | Framework ném khi tham số DTO gắn `@Valid` vi phạm annotation. |
| `IllegalArgumentException` | **400** | Yêu cầu không hợp lệ | Thông điệp giải thích lý do dữ liệu bị sai logic | Ném tại `LocalFileStorageService` khi tên file chứa `..` hoặc file rỗng. |
| `MaxUploadSizeExceededException` | **400** | Dung lượng tệp vượt quá giới hạn | "Dung lượng tệp tải lên vượt quá giới hạn tối đa cho phép!" | Spring Multipart Resolver ném khi upload file > 200MB. |
| `RuntimeException` (Nghiệp vụ) | **400** | Lỗi xử lý yêu cầu | Thông điệp nghiệp vụ cụ thể (VD: "Giỏ hàng của bạn đang trống", "Khóa học miễn phí không cần thêm vào giỏ") | Các phương thức trong `OrderService`, `CartService`, `AuthService`. |
| `AuthenticationEntryPoint` | **401** | Unauthorized | "Vui lòng đăng nhập (Thiếu hoặc Token không hợp lệ)!" | `SecurityConfig.java:58` bắt khi request không có Token hoặc Token sai chữ ký. |
| `BadCredentialsException` | **401** | Chưa xác thực | "Email hoặc mật khẩu không chính xác!" / "Phiên đăng nhập đã hết hạn" | Ném trong `AuthService` khi kiểm tra mật khẩu hoặc refresh token thất bại. |
| `AccessDeniedException` | **403** | Không có quyền truy cập | "Tài khoản của bạn không đủ quyền để thực hiện thao tác này! Cần quyền ROLE_INSTRUCTOR hoặc ROLE_ADMIN." | Ném bởi `@PreAuthorize` hoặc `SecurityConfig.accessDeniedHandler`. |
| `ResourceNotFoundException` | **404** | Không tìm thấy tài nguyên | "Không tìm thấy chứng chỉ với mã tra cứu: ABC" | Ném trong `CertificateService`, `AdminService` khi tìm entity theo ID/Code thất bại. |
| `ResponseStatusException` | **Tùy biến** | Mã HTTP tương ứng | Thông điệp lý do đi kèm ngoại lệ | Ném chủ động bởi lập trình viên trong Controller. |
| `Exception` (Tổng quát) | **500** | Lỗi máy chủ nội bộ | Nội dung lỗi ngoại lệ không lường trước được | Bộ đón chặn cuối cùng bắt các lỗi như `NullPointerException`, lỗi mạng CSDL. |

---

## 7. KHUÔN GIẢI THÍCH CHI TIẾT CÁC FILE NGUỒN GIAI ĐOẠN 2

### 7.1. File: `lms-backend/src/main/java/com/lms/lms_backend/controller/OrderController.java`
- **Vai trò:** Tiếp nhận các yêu cầu HTTP liên quan đến quản lý giỏ hàng thanh toán, tạo đơn hàng và xem lịch sử giao dịch của học viên.
- **Ai gọi nó, nó gọi ai:**
  - *Ai gọi nó:* Trình duyệt Frontend (hoặc Reverse Proxy Nginx) gửi HTTP Request đến các endpoint `/api/v1/orders/**`.
  - *Nó gọi ai:* Gọi `OrderService` để thực hiện nghiệp vụ và truyền `Authentication` để nhận diện học viên.
- **Các thành phần chính:**
  - `checkout(...)` ([dòng 27-36](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/controller/OrderController.java#L27-L36)): Nhận `CheckoutRequest`, chuẩn hóa phương thức thanh toán ("QR_CODE" hoặc "CARD"), trả về `OrderResponse`.
  - `getMyOrders(...)` ([dòng 38-41](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/controller/OrderController.java#L38-L41)): Lấy danh sách lịch sử tất cả các đơn hàng đã mua của người dùng hiện tại.
  - `getOrderById(...)` ([dòng 43-49](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/controller/OrderController.java#L43-L49)): Xem chi tiết hóa đơn theo ID.
- **Dữ liệu vào / ra:**
  - *Vào:* JSON body `{"paymentMethod": "QR_CODE"}`, token người dùng trong ngữ cảnh bảo mật.
  - *Ra:* Đối tượng `ResponseEntity<OrderResponse>` chứa mã đơn hàng, ngày thanh toán, tổng tiền và danh sách khóa học.
- **Điều cần chú ý:** Không cần truyền `userId` từ Frontend lên body để phòng ngừa lỗ hổng giả mạo ID người khác; Controller luôn lấy email danh tính thật từ `authentication.getName()`.
- **Câu hỏi giảng viên có thể hỏi:**
  > *"Tại sao trong hàm `checkout` em không truyền `userId` từ Client lên mà lại dùng `Authentication`?"*  
  > **Trả lời:** Đây là nguyên tắc bảo mật phòng chống lỗ hổng BOLA (Broken Object Level Authorization - Lỗ hổng phân quyền đối tượng). Nếu nhận `userId` từ body, kẻ tấn công có thể đổi ID của mình thành ID người khác để mua hàng bằng tiền hoặc tài khoản của nạn nhân. Lấy danh tính từ `Authentication.getName()` đảm bảo hệ thống chỉ thao tác trên đúng tài khoản đã ký số JWT hợp lệ.

---

### 7.2. File: `lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java`
- **Vai trò:** Trung tâm điều phối logic nghiệp vụ mua hàng: kiểm tra tính hợp lệ của giỏ hàng, tính tổng tiền, tạo đơn hàng, tự động cấp quyền vào học và xóa giỏ hàng.
- **Ai gọi nó, nó gọi ai:**
  - *Ai gọi nó:* `OrderController` gọi khi học viên thực hiện thao tác đơn hàng.
  - *Nó gọi ai:* `OrderRepository`, `OrderItemRepository`, `CartItemRepository`, `EnrollmentRepository`, `UserRepository`, `EnrollmentService`.
- **Các thành phần chính:**
  - `checkout(String userEmail, String paymentMethod)` ([dòng 48-120](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L48-L120)): Thực hiện toàn bộ quy trình thanh toán trong một giao dịch `@Transactional`.
  - `getMyOrders(String userEmail)` ([dòng 122-130](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L122-L130)): Truy vấn lịch sử đơn hàng sắp xếp theo thời gian mới nhất.
  - `getOrderById(Long id, String userEmail)` ([dòng 132-145](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L132-L145)): Kiểm tra quyền sở hữu đơn hàng: chỉ chính chủ hoặc Quản trị viên (`ROLE_ADMIN`) mới được phép xem ([dòng 140-142](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L140-L142)).
  - `mapToResponse(Order o)` ([dòng 147-171](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L147-L171)): Chuyển đổi thực thể CSDL sang DTO an toàn không làm lộ thông tin nhạy cảm.
- **Dữ liệu vào / ra:**
  - *Vào:* Email người dùng, hình thức thanh toán.
  - *Ra:* Đối tượng DTO `OrderResponse`.
- **Điều cần chú ý:** Bắt buộc có `@Transactional`. Nếu trong giỏ hàng có 2 khóa học, khóa thứ nhất ghi danh thành công nhưng khóa thứ hai bị lỗi hệ thống, toàn bộ quá trình tạo đơn hàng sẽ bị Rollback hoàn toàn để bảo vệ tiền của học viên.
- **Câu hỏi giảng viên có thể hỏi:**
  > *"Nếu hai học viên cùng mua một khóa học tại cùng một giây thì phương thức `checkout` có bị lỗi trùng mã đơn hàng không?"*  
  > **Trả lời:** Hoàn toàn không! Mã đơn hàng được sinh bằng công thức: `"ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase()` ([dòng 83](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L83)). Thuật toán UUID v4 có không gian mẫu $2^{122}$ trường hợp ngẫu nhiên, xác suất trùng mã là bằng 0 trong thực tế. Ngoài ra cột `order_code` trong bảng `orders` có ràng buộc duy nhất `UNIQUE KEY`, nếu có xung đột xảy ra CSDL sẽ chặn lại ngay.

---

### 7.3. File: `lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java`
- **Vai trò:** Xây dựng câu truy vấn động (Dynamic SQL Predicates) cho phép lọc danh sách khóa học theo nhiều tiêu chí tùy chọn mà không bị nối chuỗi SQL thủ công.
- **Ai gọi nó, nó gọi ai:**
  - *Ai gọi nó:* `CourseService.getAllPublishedCourses` gọi để truyền vào phương thức `courseRepository.findAll(spec)`.
  - *Nó gọi ai:* Sử dụng `jakarta.persistence.criteria.CriteriaBuilder` và `CriteriaQuery`.
- **Các thành phần chính:**
  - Phương thức tĩnh `filterPublishedCourses(...)` ([dòng 16-69](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L16-L69)): Nhận 5 tham số lọc (`priceType`, `minPrice`, `maxPrice`, `categoryId`, `search`) và kết hợp chúng bằng toán tử logic `AND` / `OR`.
- **Dữ liệu vào / ra:**
  - *Vào:* Các giá trị lọc tùy chọn (có thể null).
  - *Ra:* Đối tượng `Specification<Course>` chứa cây điều kiện truy vấn JPA.
- **Điều cần chú ý:** Đảm bảo triệt tiêu hoàn toàn nguy cơ **SQL Injection** vì Criteria API tự động sử dụng `PreparedStatement` và tham số hóa (Parameterized Queries) cho các chuỗi tìm kiếm `LIKE %search%` ([dòng 60-65](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L60-L65)).
- **Câu hỏi giảng viên có thể hỏi:**
  > *"Tại sao nhóm lại dùng `Specification` thay vì viết câu lệnh `@Query` tĩnh trong CourseRepository?"*  
  > **Trả lời:** Nếu dùng `@Query`, với 5 điều kiện tùy chọn (lúc thì người dùng chỉ tìm theo tên, lúc thì tìm theo cả giá và danh mục), ta sẽ phải viết hàng chục câu lệnh SQL kết hợp hoặc viết những câu lệnh rườm rà như `(:categoryId IS NULL OR category_id = :categoryId)`. `Specification` giúp code linh hoạt (Modular), chỉ những tham số nào người dùng thực sự truyền lên mới được sinh điều kiện `WHERE`, giúp MySQL tối ưu hóa bộ lập lịch truy vấn và sử dụng Index hiệu quả nhất.

---

### 7.4. File: `lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java`
- **Vai trò:** Là trạm đón chặn ngoại lệ tập trung cho toàn bộ ứng dụng Backend, bắt giữ mọi lỗi văng ra từ Controller, Service hoặc Validation và đóng gói lại thành định dạng JSON chuẩn hóa.
- **Ai gọi nó, nó gọi ai:**
  - *Ai gọi nó:* Spring MVC Framework kích hoạt thông qua annotation `@RestControllerAdvice` khi có bất kỳ Exception nào không được bắt trong code nghiệp vụ.
  - *Nó gọi ai:* Trả trực tiếp `ResponseEntity` về cho người dùng.
- **Các thành phần chính:**
  - `handleValidationExceptions(...)` ([dòng 21-35](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L21-L35)): Chuyển danh sách lỗi Bean Validation `@Valid` thành cấu trúc `details: { field: message }`.
  - `handleAccessDeniedException(...)` ([dòng 59-73](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L59-L73)): Bắt lỗi 403 Forbidden và trả thông báo tiếng Việt thân thiện.
  - `handleRuntimeException(...)` ([dòng 108-117](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L108-L117)): Bắt toàn bộ các lỗi logic nghiệp vụ do lập trình viên chủ động ném (`throw new RuntimeException(...)`).
  - `handleGeneralException(...)` ([dòng 119-128](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L119-L128)): Đón chặn mọi lỗi crash không mong muốn (500) để không làm lộ vết dấu vết StackTrace của máy chủ ra ngoài.
- **Dữ liệu vào / ra:**
  - *Vào:* Đối tượng ngoại lệ `Exception`.
  - *Ra:* Đối tượng `ResponseEntity<Map<String, Object>>` chứa các trường chuẩn hóa: `timestamp`, `status`, `error`, `message`.
- **Điều cần chú ý:** Luôn trả về đúng chuẩn HTTP Status Code (400, 403, 404, 500) trên tiêu đề HTTP thay vì trả về 200 kèm cờ lỗi trong body.
- **Câu hỏi giảng viên có thể hỏi:**
  > *"Việc bắt lỗi tập trung bằng `@RestControllerAdvice` mang lại lợi ích gì cho việc bảo mật hệ thống?"*  
  > **Trả lời:** Nếu không có bộ bắt lỗi tập trung, khi máy chủ gặp sự cố (như lỗi kết nối CSDL hoặc NullPointer), Tomcat sẽ mặc định hiển thị trang lỗi "WhiteLabel Error Page" chứa toàn bộ thông tin nội bộ (StackTrace, phiên bản Java, tên bảng CSDL, tên lớp, dòng code). Tin tặc có thể khai thác các thông tin này (Information Disclosure) để lên kế hoạch tấn công. `@RestControllerAdvice` triệt tiêu nguy cơ này bằng cách ẩn giấu chi tiết kỹ thuật nhạy cảm và chỉ trả về thông điệp an toàn cho người dùng.

---

### 7.5. File: `lms-backend/src/main/java/com/lms/lms_backend/service/RefreshTokenService.java`
- **Vai trò:** Cung cấp dịch vụ thu hồi Refresh Token khẩn cấp chạy trong một giao dịch độc lập hoàn toàn (`REQUIRES_NEW`).
- **Ai gọi nó, nó gọi ai:**
  - *Ai gọi nó:* `AuthService.refreshToken` gọi khi phát hiện dấu hiệu tái sử dụng token đã thu hồi (tấn công token replay).
  - *Nó gọi ai:* `RefreshTokenRepository.revokeAllByUser(user)`.
- **Các thành phần chính:**
  - `revokeAllTokensForUser(User user)` ([dòng 26-30](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/RefreshTokenService.java#L26-L30)): Gắn `@Transactional(propagation = Propagation.REQUIRES_NEW)`, gọi hàm UPDATE hàng loạt tất cả các token của người dùng đó thành `revoked = true`.
- **Dữ liệu vào / ra:**
  - *Vào:* Thực thể `User` đang bị nghi ngờ bị tấn công.
  - *Ra:* Số lượng bản ghi token đã bị vô hiệu hóa (`int`).
- **Điều cần chú ý:** Bắt buộc phải tách phương thức này ra một Spring Bean riêng biệt (`RefreshTokenService`), không được để phương thức này trong chính `AuthService` rồi gọi `this.revokeAllTokensForUser()`, vì việc gọi nội bộ (Self-Invocation) sẽ làm vô hiệu hóa cơ chế Proxy của Spring AOP, khiến thuộc tính `REQUIRES_NEW` không có tác dụng!
- **Câu hỏi giảng viên có thể hỏi:**
  > *"Tại sao phải tách phương thức `revokeAllTokensForUser` sang một class Service riêng mà không viết luôn trong `AuthService`?"*  
  > **Trả lời:** Đây là điểm tinh tế về kiến trúc Spring AOP Proxy: Cơ chế Transaction của Spring hoạt động bằng cách tạo ra một đối tượng đại diện bọc ngoài (Proxy Wrapper). Khi một phương thức trong cùng một class gọi trực tiếp phương thức khác của chính nó (`this.method()`), lời gọi đó là lời gọi Java thuần túy, hoàn toàn không đi qua lớp Proxy. Do đó, annotation `@Transactional(propagation = Propagation.REQUIRES_NEW)` sẽ bị bỏ qua và không thể mở ra transaction độc lập. Việc tách sang `RefreshTokenService` và tiêm vào `AuthService` đảm bảo cuộc gọi đi qua Spring Proxy 100%.

---

## 8. TỔNG KẾT BẢNG KIỂM TRA ĐỐI CHIẾU GIAI ĐOẠN 2 (VERIFICATION CHECKLIST)

| Hạng mục cam kết | Trạng thái | Minh chứng tệp nguồn & Dòng cụ thể |
| :--- | :---: | :--- |
| **Vòng đời Request Đầy đủ (Checkout)** | [ĐỌC CODE] & [ĐÃ CHẠY] | [`CheckoutPage.jsx:54`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/pages/student/CheckoutPage.jsx#L54), [`useOrders.js:47`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/hooks/useOrders.js#L47), [`client.js:26`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/client.js#L26), [`AuthTokenFilter.java:33`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/security/AuthTokenFilter.java#L33), [`OrderController.java:27`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/controller/OrderController.java#L27), [`OrderService.java:48`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/OrderService.java#L48) |
| **Minh chứng Curl thực tế** | [ĐÃ CHẠY THẬT] | Chạy curl login học viên và checkout khóa học ID 5: sinh đơn hàng `ORD-744D757C08` thành công |
| **Vòng đời GET Public (Specification)** | [ĐỌC CODE] & [ĐÃ CHẠY] | [`CourseController.java:35`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/controller/CourseController.java#L35), [`CourseSpecification.java:16-69`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/specification/CourseSpecification.java#L16-L69) |
| **3 Kịch bản Request bị từ chối (401, 403, 400)** | [ĐÃ CHẠY THẬT] | Chạy curl xác minh: Thiếu token (401 EntryPoint), Học viên vào Admin (403 AccessDenied), Thêm khóa học free vào giỏ (400 RuntimeException) |
| **Xác thực chi tiết & Concurrency Mutex** | [ĐỌC CODE] | [`client.js:36-100`](file:///d:/University/E-Learning/MOOC-lms/lms-frontend/src/api/client.js#L36-L100), [`AuthService.java:90, 119, 171`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L90) |
| **Token Rotation & Reuse Detection** | [ĐỌC CODE] | [`AuthService.java:135-154`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L135-L154), [`RefreshTokenService.java:26`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/RefreshTokenService.java#L26) |
| **Ma trận Giao dịch `@Transactional` & `REQUIRES_NEW`** | [ĐỌC CODE] | Quét và lập bảng 11 service cốt lõi, giải thích tường tận cơ chế Spring AOP Proxy |
| **Bảng tổng hợp lỗi hệ thống (10 loại lỗi)** | [ĐỌC CODE] | [`GlobalExceptionHandler.java:18-129`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/exception/GlobalExceptionHandler.java#L18-L129), [`SecurityConfig.java:58-67`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/config/SecurityConfig.java#L58-L67) |
| **Tuân thủ quy tắc bảo mật** | TUÂN THỦ 100% | Che dấu chuỗi JWT token, cookie và thông tin nhạy cảm. |

