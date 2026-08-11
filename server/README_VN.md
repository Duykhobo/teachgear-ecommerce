# 🛒 TechGear E-Commerce Backend API

[ 🇻🇳 Tiếng Việt ](README_VN.md) | [ 🇬🇧 English ](README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-blue.svg)
![Express](https://img.shields.io/badge/Express-v4.18-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20v7-green.svg)
![SePay](https://img.shields.io/badge/SePay-VietQR--Gateway-orange.svg)
![Telegram](https://img.shields.io/badge/Telegram-Bot--API-blue.svg)
![Build Status](https://img.shields.io/badge/Tests-26%2F26%20Passed-brightgreen.svg)

TechGear Backend là máy chủ API RESTful cấp doanh nghiệp phục vụ hệ thống thương mại điện tử TechGear. Được xây dựng với **Node.js, TypeScript, Express, MongoDB Atlas, Upstash Redis, BullQueue**, hệ thống hỗ trợ xử lý thanh toán chuyển khoản tự động qua **Cổng thanh toán SePay VietQR** và phát cảnh báo báo động khẩn cấp tới **Telegram Bot API**.

---

## 1. 📌 Mục Lục

1. [Tính Năng Chính](#-tính-năng-chính)
2. [Công Nghệ Sử Dụng & Thư Viện](#-công-nghệ-sử-dụng--thư-viện)
3. [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
4. [Hướng Dẫn Biến Môi Trường](#-hướng-dẫn-biến-môi-trường)
5. [Danh Sách API Endpoints](#-danh-sách-api-endpoints)
6. [Động Cơ Thanh Toán SePay VietQR](#-động-cơ-thanh-toán-sepay-vietqr)
7. [Hệ Thống Báo Động Telegram Khẩn Cấp](#-hệ-thống-báo-động-telegram-khẩn-cấp)
8. [Chạy Kiểm Thử Tự Động](#-chạy-kiểm-thử-tự-động)
9. [Hướng Dẫn Triển Khai Render](#-hướng-dẫn-triển-khai-render)

---

## 2. ✨ Tính Năng Chính

- 🔑 **Xác Thực Cặp JWT Token**: AccessToken (15m) & RefreshToken (100d) kết hợp mã hóa mật khẩu Bcrypt.
- 🛡️ **Phân Quyền Vai Trò (RBAC)**: Bảo vệ các route Admin quản lý sản phẩm, tồn kho và danh mục.
- 🛒 **Bảo Vệ Đơn Hàng & Tồn Kho**: Kiểm tra số lượng tồn kho khả dụng và tự động trừ kho khi thanh toán thành công.
- 💳 **Động Cơ SePay VietQR**:
  - Chuyển đổi linh hoạt giữa môi trường Sandbox & Production.
  - Xác thực chữ ký điện tử (`X-SePay-Signature` HMAC-SHA256).
  - Thuật toán bóc tách mã đơn tự động hỗ trợ cả 2 tiền tố `INV` và `PAY`.
  - Xử lý Webhook **Idempotency** chống trừ tồn kho lặp lại.
- 🤖 **Hệ Thống Báo Động Telegram**: Bán tin tức thì về đơn hàng mới và cảnh báo màu đỏ khẩn cấp khi khách chuyển thiếu tiền (`⚠️ TECHGEAR PAYMENT ALERT`).
- 📧 **Hàng Đợi Email Bất Đồng Bộ**: Xử lý gửi email xác nhận qua BullQueue & Redis.

---

## 3. 🛠️ Công Nghệ Sử Dụng & Thư Viện

- **Môi trường**: Node.js v20 LTS, TypeScript v5
- **Framework**: Express v4.18
- **Database**: MongoDB Atlas (Native Driver / Mongoose)
- **Cache & Queue**: Upstash Redis & BullQueue
- **Bảo mật & Kiểm tra**: Zod Schema, Bcrypt, JsonWebToken
- **Testing**: Jest, Supertest

---

## 4. 📁 Cấu Trúc Thư Mục

```text
server/
├── src/
│   ├── common/                 # Configs, Constants, Middlewares, Queues, Services dùng chung
│   │   ├── configs/            # Zod `.env` Validation Schema
│   │   ├── constants/          # Enums & HTTP Status Codes
│   │   ├── middlewares/        # Auth Checkers & Error Handlers
│   │   ├── queues/             # BullQueue Email Workers
│   │   ├── services/           # MongoDB & Telegram Services
│   │   └── utils/              # Logger Utilities
│   ├── modules/                # Modules chức năng theo Domain
│   │   ├── auth/               # Quản lý Đăng ký & Đăng nhập
│   │   ├── users/              # Quản lý Thông tin cá nhân
│   │   ├── products/           # Quản lý Sản phẩm
│   │   ├── categories/         # Quản lý Danh mục
│   │   ├── carts/              # Quản lý Giỏ hàng
│   │   ├── orders/             # Quản lý Checkout & Đơn hàng
│   │   └── payments/           # Động cơ SePay VietQR & Webhook
│   ├── app.ts                  # Cấu hình Express App
│   └── index.ts                # Entry Point Server
├── tests/                      # 8 Test Suites (26 Test Cases)
└── package.json                # Dependencies & Scripts
```

---

## 5. ⚙️ Hướng Dẫn Biến Môi Trường

Tạo file `.env.development.local` hoặc `.env.production` trong `server/`:

```env
PORT=3000
HOST="0.0.0.0"
NODE_ENV="production"
MONGODB_URI="mongodb+srv://..."
DB_NAME="ShoppingCart"

PASSWORD_SECRET="your_password_secret"
JWT_SECRET_ACCESS_TOKEN="your_access_token_secret"
JWT_SECRET_REFRESH_TOKEN="your_refresh_token_secret"

SEPAY_ENV="production"
SEPAY_MERCHANT_ID="SP-LIVE-NT588865"
SEPAY_SECRET_KEY="spsk_live_..."

TELEGRAM_BOT_TOKEN="8874098441:AAEQ..."
TELEGRAM_CHAT_ID="-1004294239186"
```

---

## 6. 🔌 Danh Sách API Endpoints

| Phân loại | Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/users/register` | Public | Đăng ký tài khoản người dùng mới |
| **Auth** | `POST` | `/users/login` | Public | Đăng nhập & Nhận cặp Token JWT |
| **Auth** | `POST` | `/users/refresh-token` | Public | Gia hạn AccessToken bằng RefreshToken |
| **Products** | `GET` | `/products` | Public | Lấy danh sách sản phẩm (Lọc & Phân trang) |
| **Products** | `POST` | `/products` | Admin | Tạo mới sản phẩm (Chỉ Admin) |
| **Orders** | `POST` | `/orders/checkout` | User | Khởi tạo đơn hàng từ giỏ hàng |
| **Payments** | `POST` | `/payments/sepay/ipn` | Public/SePay | Webhook xử lý thanh toán từ SePay |
| **Payments** | `POST` | `/payments/sync-history` | Admin | Đồng bộ lịch sử ngân hàng từ SePay API v2 |

---

## 7. 🧪 Chạy Kiểm Thử Tự Động

Thực thi toàn bộ bộ kiểm thử tích hợp:

```bash
# Chạy bộ test Jest
npm run test

# Kiểm tra biên dịch TypeScript
npm run build
```

---

## 8. 👨‍💻 Tác Giả & Giấy Phép

- **Tác giả / Lead Developer**: Duykhobo (TechGear Engineering Team)
- **Trang GitHub**: [https://github.com/Duykhobo](https://github.com/Duykhobo)
- **Hỗ trợ / Báo lỗi**: [TechGear Issues Page](https://github.com/Duykhobo/techgear-ecommerce/issues)
- **Giấy phép (License)**: Giấy phép MIT License (Xem chi tiết tại file [LICENSE](../LICENSE)).
