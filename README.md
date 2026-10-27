# Custom You — Nền Tảng Điều Hành & Học Tập Cá Nhân (Personal OS)

> Không gian số độc lập và tinh giản cho một người dùng: **Dashboard cá nhân thông minh** (đồng hồ thời gian thực, thời tiết trực tiếp, lịch học, to-do, ghi chú nhanh), **Nhật ký học tập & ôn thi** theo môn học, và **Theo dõi chi tiêu & thói quen** với biểu đồ trực quan.

Giao diện được thiết kế theo phong cách **Liquid Glassmorphism** (kính mờ Obsidian Violet, viền phản xạ ánh sáng Specular, bề mặt nổi đa tầng, chuyển động mượt mà 60–120 FPS), kết hợp kiến trúc Next.js App Router sạch và tuân thủ **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Phong cách giao diện**: Liquid Glassmorphism (Tailwind CSS, Glass blur, viền hairline Specular, Lucide Icons)
- **Cơ sở dữ liệu**: PostgreSQL (Neon Cloud Serverless) + Prisma ORM
- **Xác thực & Bảo mật (Auth)**:
  - NextAuth.js (Email + Password với thuật toán mã hóa `bcryptjs`)
  - **Edge Middleware** (`src/middleware.ts`) bảo vệ toàn bộ tuyến đường riêng tư
  - **Chống Brute-force**: Tự động khóa tạm thời sau 5 lần nhập sai
  - **2FA TOTP**: Tương thích Google Authenticator / Authy & 8 mã dự phòng khẩn cấp
- **Biểu đồ trực quan**: Recharts (Donut Chart phân bổ chi tiêu & Bar Chart dòng tiền 7 ngày)
- **Dữ liệu thời tiết**: Tích hợp Open-Meteo API trực tiếp (không phụ thuộc API key ngoài)
- **Kiểm thử tự động**: Vitest (100% Pass các suite Auth, Crypto, Webhook, Rules Engine, Formatters)

---

## 🌟 Các Phân Hệ Chức Năng Chính

### 1. Dashboard Cá Nhân Thông Minh (`/dashboard`)
- **Đồng hồ thời gian thực (`LiveClockCard`)**: Hiển thị giờ - phút - giây nhịp nhàng, ngày tháng tiếng Việt và lời chào thay đổi theo buổi trong ngày (Sáng, Trưa, Chiều, Tối).
- **Thời tiết trực tiếp (`WeatherCard`)**: Cập nhật nhiệt độ thực tế, cảm giác nhiệt (`Apparent`), độ ẩm, sức gió và bộ chuyển đổi nhanh giữa Hà Nội, TP. Hồ Chí Minh và Đà Nẵng.
- **Lịch học hôm nay & tuần (`TodayScheduleCard`)**: Quản lý ca học, giảng viên, giảng đường, tiến độ buổi học và bộ chọn thứ (T2 → CN) tra cứu lịch học trước.
- **To-Do nhanh (`TodayTodosCard`)**: Danh sách việc cần làm trong ngày với checkbox hoàn thành tức thì và ô thêm công việc inline.
- **Bảng nháp tức thì (`QuickScratchpadCard`)**: Bảng ghi chú nhanh tự động lưu vào cơ sở dữ liệu sau khi nhập.
- **Điểm danh thói quen (`HabitsCheckinCard`)**: Check-in thói quen 1 chạm kèm chuỗi ngày liên tiếp (Streak 🔥).

### 2. Nhật Ký Học Tập & Học Phần (`/study`)
- **Quản lý môn học & Tiến độ**: Theo dõi số tín chỉ, mục tiêu điểm số (GPA Target), giảng viên, phòng học và thanh tiến độ số buổi đã học.
- **Nhật ký buổi học**: Ghi chép kiến thức cốt lõi, thời gian học tập, bài tập về nhà và hạn nộp kèm checkbox theo dõi hoàn thành.
- **Kho tài liệu ôn tập**: Phân loại Slide bài giảng, Đề thi mẫu, Giáo trình và Tóm tắt công thức theo từng môn học kèm liên kết Drive/Web.

### 3. Theo Dõi Thu Chi & Thói Quen Kỷ Luật (`/tracker`)
- **Nhập giao dịch siêu tốc**: Nhập khoản thu/chi (Số tiền, danh mục, ngày, ghi chú) lưu ngay vào hệ thống mà không cần qua các bước ví tài khoản rườm rà.
- **Biểu đồ phân bổ chi tiêu (Donut Chart)**: Thống kê trực quan tỷ trọng phần trăm chi tiêu theo danh mục.
- **Biểu đồ dòng tiền (Bar Chart)**: So sánh thu nhập và chi tiêu trong 7 ngày gần nhất.
- **Bảng kỷ luật thói quen**: Điểm danh và theo dõi chuỗi ngày kỷ luật liên tiếp.

### 4. Năng Suất Cá Nhân
- **Việc cần làm (`/productivity/todos`)**: Quản lý danh sách to-do chi tiết với độ ưu tiên và deadline.
- **Thói quen (`/productivity/habits`)**: Quản lý các thói quen hàng ngày kèm lịch sử check-in.
- **Sổ tay ghi chú (`/productivity/notes`)**: Lưu trữ và quản lý ghi chú cá nhân với chế độ ghim quan trọng.

### 5. Cài Đặt & Quyền Riêng Tư (`/settings/*`)
- **Tùy chọn hiển thị (`/settings/preferences`)**: Tùy chỉnh màu sắc, giao diện và ngưỡng cảnh báo ngân sách.
- **Quy tắc phân loại tự động (`/settings/rules`)**: Thiết lập luật tự động gán danh mục khi có nội dung giao dịch.
- **Bảo mật tài khoản (`/settings/security`)**: Cấu hình xác thực 2 lớp (2FA TOTP), sao lưu mã bảo mật khẩn cấp.
- **Quyền riêng tư dữ liệu (`/settings/privacy`)**:
  - **Quyền trích xuất dữ liệu (Data Portability)**: Tải toàn bộ dữ liệu cá nhân về máy dưới dạng JSON.
  - **Quyền được lãng quên (Right to be Forgotten)**: Xóa sạch vĩnh viễn dữ liệu tài chính và năng suất bằng xác thực mật khẩu.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Thử

### 1. Chuẩn bị biến môi trường (`.env`)
Sao chép `.env.example` thành `.env` và điền cấu hình của bạn:
```bash
# Database URL (PostgreSQL / Neon Cloud)
DATABASE_URL="postgresql://username:password@your-neon-host.aws.neon.tech/myhub?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-random-32-byte-hex-string>"

# Khóa chủ mã hóa AES-256-GCM (64 ký tự Hex = 32 bytes)
ENCRYPTION_MASTER_KEY="<generate-64-character-hex-string>"

# Tài khoản quản trị ban đầu
DEFAULT_ADMIN_EMAIL="admin@example.com"
DEFAULT_ADMIN_PASSWORD="<choose-a-strong-password>"
```

### 2. Đồng bộ Cơ sở dữ liệu & Khởi tạo dữ liệu mẫu
```bash
# Cài đặt các gói phụ thuộc
npm install

# Đồng bộ Prisma Schema với Neon PostgreSQL
npm run db:push

# Khởi tạo dữ liệu người dùng ban đầu và danh mục
npm run db:seed

# Khởi tạo dữ liệu học tập mẫu (Môn học, bài tập, tài liệu ôn thi)
npm run db:seed-academic
```

### 3. Chạy kiểm thử tự động (Unit Tests)
```bash
npm run test
```

### 4. Khởi động môi trường phát triển (Dev Server)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 🔑 Bảo Mật Chủ Sở Hữu (Single-User Lock)

Hệ thống được thiết kế theo mô hình tài khoản độc lập duy nhất:
- **Email quản trị**: Được xác định qua biến môi trường `DEFAULT_ADMIN_EMAIL` trong `.env`.
- Mọi nỗ lực đăng nhập bằng bất kỳ tài khoản email nào khác đều bị từ chối truy cập ngay lập tức.
- Không tồn tại backdoor hay mật khẩu mặc định hardcode trong mã nguồn.
- Mọi trang quản trị đều được bảo vệ nghiêm ngặt qua lớp Edge Middleware.
