# 🛒 TechGear E-Commerce Backend API

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)
![SePay](https://img.shields.io/badge/SePay-VietQR-orange.svg)
![Telegram](https://img.shields.io/badge/Telegram-Bot--API-blue.svg)
![Build Status](https://img.shields.io/badge/Tests-26%2F26%20Passed-brightgreen.svg)

TechGear Backend là hệ thống API thương mại điện tử chuyên nghiệp được xây dựng bằng **Node.js, TypeScript, Express, MongoDB Atlas, Redis BullQueue**, tích hợp cổng thanh toán tự động **SePay VietQR** và hệ thống thông báo báo động **Telegram Bot**.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

- 🔑 **Authentication & Authorization**: Đăng ký, Đăng nhập, Mã hóa mật khẩu Bcrypt, Token JWT (Access Token 15m & Refresh Token 100d), Phân quyền RBAC (`User` & `Admin`).
- 📦 **Quản Lý Sản Phẩm & Tồn Kho**: Phân trang, lọc danh mục, cập nhật kho tự động khi đơn hàng thanh toán thành công.
- 🛒 **Giỏ Hàng & Checkout**: Tính toán đơn hàng chuẩn xác, sinh mã hóa đơn `INV<ObjectId>` thuần chữ cái không chứa dấu gạch ngang.
- 💳 **Cổng Thanh Toán SePay VietQR (Dual Sandbox & Production)**:
  - Tự động chạy song song 2 môi trường Sandbox & Production.
  - Chữ ký bảo mật **HMAC-SHA256** (`X-SePay-Signature` & `X-SePay-Timestamp`).
  - Thuật toán bóc tách mã đơn hàng thông minh chấp nhận cả 2 tiền tố **`INV`** và **`PAY`**.
  - Hàm tạo ảnh QR động `generateVietQRUrl(...)`.
  - Xử lý Webhook **Idempotency** chống trùng lặp dữ liệu.
- 🤖 **Dịch Vụ Thông Báo Telegram Bot**:
  - Gửi tin nhắn tức thì về Nhóm Telegram `Techgear` và Bot cá nhân.
  - Tự động phát hiện và gửi cảnh báo màu đỏ `⚠️ TECHGEAR PAYMENT ALERT` khi khách **chuyển thiếu tiền**.
  - API `POST /payments/sync-history` đồng bộ toàn bộ lịch sử giao dịch từ SePay REST API v2.
- 🧪 **Chất Lượng Code**: Phủ **8/8 Test Suites (26/26 Test Cases Passed 100%)** qua Jest & Supertest.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local (Quick Start)

### 1. Clone Dự Án
```bash
git clone https://github.com/Duykhobo/techgear-ecommerce.git
cd techgear-ecommerce/server
```

### 2. Cài Đặt Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Cấu Hình Biến Môi Trường (.env)
Tạo file `.env.development.local` trong thư mục `server/`:

```env
PORT=3000
HOST="0.0.0.0"
NODE_ENV="development"

MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/ShoppingCart"
DB_NAME="ShoppingCart"

PASSWORD_SECRET="techgear_password_secret_key_2026"
JWT_SECRET_ACCESS_TOKEN="techgear_access_token_secret_key_2026"
JWT_SECRET_REFRESH_TOKEN="techgear_refresh_token_secret_key_2026"

SEPAY_ENV="sandbox"
SEPAY_SANDBOX_MERCHANT_ID="SP-TEST-NT942323"
SEPAY_SANDBOX_SECRET_KEY="spsk_test_hZXd1g3X82pifpXQtdY8vhxYkES54gJ4"
SEPAY_SANDBOX_API_KEY="6EHRSIR3ZMDTS1HU9XKTBV0UXNESFZOUBH2P7WYAP4QZVEFLJJAYLROG3JXQBHDU"

TELEGRAM_BOT_TOKEN="8874098441:AAEQET7toAgwEZwRP70lLwElqrawF7glwQg"
TELEGRAM_CHAT_ID="-1004294239186"
```

### 4. Chạy Server ở Chế Độ Development
```bash
npm run dev
```

Server sẽ khởi chạy tại: `http://localhost:3000`

---

## 🧪 Chạy Kiểm Thử (Run Automated Tests)

```bash
npm run test
```

---

## 🛠️ Build Production
```bash
npm run build
npm start
```

---

## 📄 License
MIT License. Developed with ❤️ for TechGear E-Commerce.
