# MyHub — Dashboard Cá Nhân Hóa (Single-User)

> Ứng dụng quản lý cá nhân hóa toàn diện gom: Tài chính thông minh (Kết nối Ngân hàng Việt Nam chuẩn Adapter), Việc cần làm, Mục tiêu, Thói quen hằng ngày và Ghi chú.

Giao diện phát triển theo ngôn ngữ **Antigravity Spatial Design** (Glassmorphism, Depth, Floating UI) và kiến trúc backend phân tầng sạch (**Clean Layered Architecture**), tuân thủ chặt chẽ tinh thần **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Custom Antigravity 3D transforms & glassmorphism
- **Database**: PostgreSQL (Neon Cloud Database) + Prisma ORM
- **Xác thực (Auth)**: NextAuth.js (Email + Password, 2FA TOTP Google Authenticator & Backup codes)
- **Tiền tệ**: Chuẩn số nguyên `BigInt` (VND) loại trừ hoàn toàn lỗi sai số số thực float
- **Mã hóa nhạy cảm**: AES-256-GCM với Master Key 32-byte
- **Kiểm thử tự động**: Vitest

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Thử

### 1. Cấu hình biến môi trường (`.env`)
Sao chép tệp mẫu hoặc chỉnh sửa `.env`:
```bash
# Database URL (PostgreSQL / Neon)
DATABASE_URL="postgresql://username:password@your-neon-host.aws.neon.tech/myhub?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="0000000000000000000000000000000000000000000000000000000000000000"

# Khóa chủ mã hóa AES-256-GCM (64 hex characters = 32 bytes)
ENCRYPTION_MASTER_KEY="1111111111111111111111111111111111111111111111111111111111111111"

# Tài khoản mặc định khi chạy seed
DEFAULT_ADMIN_EMAIL="admin@myhub.local"
DEFAULT_ADMIN_PASSWORD="MyHub@2026!"
```

### 2. Đồng bộ Database & Khởi tạo Dữ liệu mẫu (Seed)
```bash
# Đẩy schema lên database PostgreSQL
npm run db:push

# Khởi tạo dữ liệu mẫu (Tài khoản admin, ví VCB/Momo, danh mục, quy tắc tự động)
npm run db:seed
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

## 🔑 Tài Khoản Đăng Nhập Mẫu

- **Email**: `admin@myhub.local`
- **Mật khẩu**: `MyHub@2026!`
- **Bảo mật 2FA**: Có thể kích hoạt tại trang Cài đặt Bảo mật qua mã QR Google Authenticator.

---

## 🛡️ Đặc Tính An Toàn & Pháp Lý (Nghị định 13/2023/NĐ-CP)

1. **Không lưu trữ mật khẩu ngân hàng**: Hệ thống chỉ nhận dữ liệu thụ động thông qua Webhook ký HMAC hoặc file sao kê CSV/XLSX người dùng tải lên.
2. **Che giấu số tài khoản**: Mọi tài khoản ngân hàng chỉ hiển thị 4 số cuối (Vd: `•••• 6868`).
3. **Mã hóa AES-256-GCM**: Toàn bộ API token, secret key ngân hàng đều được mã hóa trong cơ sở dữ liệu.
4. **Quyền của chủ thể dữ liệu**:
   - `GET /api/user/export-data`: Xuất toàn bộ dữ liệu cá nhân dạng JSON/ZIP có cấu trúc.
   - `POST /api/user/purge-data`: Xóa sạch và vĩnh viễn mọi dữ liệu cá nhân khỏi hệ thống (Quyền được lãng quên).
