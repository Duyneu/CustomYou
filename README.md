# MyHub — Bảng Điều Khiển Cá Nhân Hóa (Single-User)

> Không gian số độc lập và tinh giản cho một người dùng: Quản lý tài chính cá nhân thông minh (kết nối ngân hàng Việt Nam, VietQR), kiểm soát ngân sách tháng, việc cần làm, mục tiêu, thói quen và sổ tay ghi chú.

Giao diện được thiết kế theo phong cách **Hallmark Modern-Minimalism** (đơn sắc tinh tế, viền hairline sắc nét, không đổ bóng hào nhoáng, không hiệu ứng rườm rà) kết hợp kiến trúc phân tầng sạch (**Clean Architecture**), tuân thủ nghiêm ngặt **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Phong cách giao diện**: Hallmark Modern-Minimalism (Tailwind CSS, bảng màu trung tính không chroma, số liệu `tabular-nums font-mono`)
- **Cơ sở dữ liệu**: PostgreSQL (Neon Cloud Database) + Prisma ORM
- **Xác thực (Auth)**: NextAuth.js (Email + Password, 2FA TOTP Google Authenticator & 8 mã dự phòng khẩn cấp)
- **Tiền tệ**: Số nguyên `BigInt` (VND) chống sai số số thực float
- **Mã hóa an toàn**: AES-256-GCM với Master Key 32-byte
- **Biểu đồ**: Recharts (Xu hướng 6 tháng & cơ cấu danh mục)
- **Kiểm thử tự động**: Vitest

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Thử

### 1. Cấu hình biến môi trường (`.env`)
Sao chép `.env.example` thành `.env` và điền cấu hình:
```bash
# Database URL (PostgreSQL / Neon Cloud)
DATABASE_URL="postgresql://username:password@your-neon-host.aws.neon.tech/myhub?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="0000000000000000000000000000000000000000000000000000000000000000"

# Khóa chủ mã hóa AES-256-GCM (64 ký tự Hex = 32 bytes)
ENCRYPTION_MASTER_KEY="1111111111111111111111111111111111111111111111111111111111111111"

# Webhook Secret (Dùng cho Casso / SePay)
BANK_WEBHOOK_SECRET="REDACTED_SECRET"

# Tài khoản mặc định khi chạy seed
DEFAULT_ADMIN_EMAIL="admin@example.com"
DEFAULT_ADMIN_PASSWORD="REDACTED_PASS"
```

### 2. Đồng bộ Database & Khởi tạo Dữ liệu mẫu (Seed)
```bash
# Đồng bộ Prisma Schema với Neon Database
npm run db:push

# Khởi tạo dữ liệu mẫu (Admin, tài khoản VCB/Momo/Tiền mặt, 11 danh mục, luật tự động)
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

## 🏦 Hướng Dẫn Đăng Ký & Kết Nối Webhook Ngân Hàng

MyHub thiết kế sẵn kiến trúc **BankProvider Adapter** để tích hợp biến động số dư thụ động:

### 1. Dịch vụ SePay (sepay.vn)
1. Đăng ký tài khoản tại [sepay.vn](https://sepay.vn) và liên kết tài khoản ngân hàng của bạn.
2. Tại mục **Tích hợp Webhook**, tạo một Webhook mới:
   - **URL Webhook**: `https://<ten-mien-cua-ban>.vercel.app/api/webhooks/bank/sepay`
   - **Xác thực**: Điền Bearer Token hoặc API Key tương ứng với biến `BANK_WEBHOOK_SECRET` trong `.env`.
3. Khi phát sinh biến động số dư, SePay sẽ gửi payload JSON về MyHub. Hệ thống tự động:
   - Xác thực chữ ký / Token.
   - Kiểm tra chống trùng lặp (Idempotent qua mã `id`/`transactionNumber`).
   - Khớp từ khóa giao dịch (Vd: "GRAB" → Danh mục "Di chuyển") và cập nhật trực tiếp số dư tài khoản.
   - Ghi lại nhật ký kiểm toán trong `WebhookAuditLog`.

### 2. Dịch vụ Casso (casso.vn)
1. Đăng ký tài khoản tại [casso.vn](https://casso.vn) và thêm tài khoản ngân hàng.
2. Vào mục **Cài đặt Webhook**:
   - **URL Webhook**: `https://<ten-mien-cua-ban>.vercel.app/api/webhooks/bank/casso`
   - **Secure Token**: Đặt token trùng với `BANK_WEBHOOK_SECRET`.
3. Hệ thống MyHub sẽ tự động xử lý batch các giao dịch gửi về, lọc trùng và phân loại tự động.

---

## 🔑 Quyền Truy Cập Chủ Sở Hữu (Single-User Lock)

Hệ thống được thiết lập chế độ bảo mật nghiêm ngặt chỉ dành riêng cho một chủ nhân duy nhất:
- **Email chủ nhân**: `admin@example.com`
- Mọi nỗ lực đăng nhập bằng bất kỳ tài khoản email nào khác đều sẽ bị từ chối truy cập ngay lập tức.
- **Bảo mật 2FA**: Có thể kích hoạt thêm tại `/settings/security` qua ứng dụng Google Authenticator.

---

## 🛡️ Đặc Tính An Toàn & Tuân Thủ Nghị Định 13/2023/NĐ-CP

1. **Không lưu thông tin đăng nhập ngân hàng**: Không bao giờ hỏi hay lưu username/password/OTP Internet Banking.
2. **Che giấu số tài khoản**: Chỉ hiển thị 4 chữ số cuối (VD: `•••• 5938`).
3. **Mã hóa AES-256-GCM**: Toàn bộ chuỗi bí mật, token ngân hàng được mã hóa đối xứng trong cơ sở dữ liệu.
4. **Quyền trích xuất dữ liệu (Data Portability)**: Tải về toàn bộ thông tin cá nhân dưới dạng JSON tại `/settings/privacy` hoặc gọi endpoint `GET /api/user/export-data`.
5. **Quyền được lãng quên (Right to be Forgotten)**: Xóa sạch vĩnh viễn toàn bộ dữ liệu tài chính và năng suất bằng mật khẩu tại `/settings/privacy` hoặc gọi `POST /api/user/purge-data`.
