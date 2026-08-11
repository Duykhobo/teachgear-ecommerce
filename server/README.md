# 🛒 TechGear E-Commerce Enterprise Backend API

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-blue.svg)
![Express](https://img.shields.io/badge/Express-v4.18-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20v7-green.svg)
![Redis](https://img.shields.io/badge/Redis-Upstash-red.svg)
![SePay](https://img.shields.io/badge/SePay-VietQR--Gateway-orange.svg)
![Telegram](https://img.shields.io/badge/Telegram-Bot--API-blue.svg)
![Build Status](https://img.shields.io/badge/Tests-26%2F26%20Passed-brightgreen.svg)

TechGear Backend là hệ thống API thương mại điện tử cấp doanh nghiệp (Enterprise Grade) được xây dựng theo kiến trúc decoupled hiện đại với **Node.js, TypeScript, Express, MongoDB Atlas, Redis BullQueue**, hỗ trợ xử lý thanh toán tự động qua **Cổng thanh toán SePay VietQR (Dual Sandbox & Production)** và phát cảnh báo giao dịch trực tiếp tới **Telegram Bot API**.

---

## 📖 MỤC LỤC (Table of Contents)

1. [📌 Tổng Quan & Kiến Trúc Hệ Thống](#-tổng-quan--kiến-trúc-hệ-thống)
2. [✨ Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
3. [🛠️ Công Nghệ Sử Dụng (Tech Stack)](#️-công-nghệ-sử-dụng-tech-stack)
4. [📋 Cấu Hình Biến Môi Trường (.env)](#-cấu-hình-biến-môi-trường-env)
5. [🔌 Chi Tiết Danh Sách API Endpoints](#-chi-tiết-danh-sách-api-endpoints)
6. [💳 Xử Lý Thanh Toán SePay VietQR & Webhook IPN](#-xử-lý-thanh-toán-sepay-vietqr--webhook-ipn)
7. [🤖 Hệ Thống Thông Báo Telegram & Cảnh Báo Lỗi](#-hệ-thống-thông-báo-telegram--cảnh-báo-lỗi)
8. [🧪 Hướng Dẫn Chạy Test Suite](#-hướng-dẫn-chạy-test-suite)
9. [🚀 Hướng Dẫn Cài Đặt & Triển Khai Render / Docker](#-hướng-dẫn-cài-đặt--triển-khai-render--docker)
10. [📄 Giấy Phép & Bản Quyền](#-giấy-phép--bản-quyền)

---

## 📌 TỔNG QUAN & KIẾN TRÚC HỆ THỐNG

### Sơ Đồ Luồng Hoạt Động (Architecture Flow)

```mermaid
graph TD
    Client["📱 Web Frontend / Mobile App"] -->|1. REST API Requests| Express["🚀 Express Server (TypeScript / Node.js)"]
    Express -->|2. Query & Store Data| Mongo[("🍃 MongoDB Atlas Database")]
    Express -->|3. Cache & Queue Jobs| Redis[("⚡ Upstash Redis & BullQueue")]
    Redis -->|4. Async Email Job| EmailWorker["📧 Email Worker (Nodemailer)"]
    
    Client -->|5. Scan VietQR Code| SePayApp["🏦 App Ngân Hàng / SePay Gateway"]
    SePayApp -->|6. Instant Webhook IPN (HTTP POST)| IPNHandler["⚡ /payments/sepay/ipn Controller"]
    
    IPNHandler -->|7. Verify HMAC-SHA256 Signature| Security["🛡️ HMAC Security Validator"]
    Security -->|8. Mark Paid & Deduct Inventory Stock| Mongo
    Security -->|9. Send Order Confirmation Email| EmailWorker
    Security -->|10. Dispatch Success / Underpaid Alert| Telegram["🤖 Telegram Group & Bot API"]
```

---

## ✨ TÍNH NĂNG NỔI BẬT

### 1. 🔑 Authentication & Authorization (Xác Thực & Phân Quyền)
- **Password Security**: Mã hóa mật khẩu 1-way bằng `bcrypt` (10 rounds).
- **Dual JWT Tokens**: 
  - `AccessToken`: Thời hạn ngắn (15 phút), dùng để gọi các API protected.
  - `RefreshToken`: Thời hạn dài (100 ngày), dùng để gia hạn AccessToken mới.
- **Role-Based Access Control (RBAC)**: Phân quyền `User` và `Admin` chặt chẽ ở các route quản trị (`/products`, `/categories`).

### 2. 📦 Product Catalog & Stock Guard (Sản Phẩm & Tồn Kho)
- Phân trang chuẩn (Pagination), tìm kiếm từ khóa, lọc theo danh mục & khoảng giá.
- **Stock Guard**: Tự động chặn khi người dùng đặt số lượng vượt quá tồn kho khả dụng (`stock`).

### 3. 🛒 Cart & Order Processing (Giỏ Hàng & Checkout)
- Quản lý giỏ hàng theo từng User ID.
- **Invoice Number Generator**: Sinh mã đơn hàng chuẩn `INV<ObjectId>` thuần chữ cái (`A-Z`) không chứa gạch ngang `-`, đảm bảo 100% tương thích ngân hàng & SePay.

### 4. 💳 SePay VietQR Payment Gateway Engine
- **Dual-Environment**: Tự động chuyển đổi giữa **Sandbox (Test)** và **Production (Live)**.
- **HMAC-SHA256 Security**: Xác thực chữ ký `X-SePay-Signature` & `X-SePay-Timestamp`.
- **Regex Matcher**: Bóc tách tự động các tiền tố mã đơn `INV` và `PAY`.
- **Idempotency Guard**: Nhận Webhook lặp lại mà không bị trừ tồn kho lần 2.

### 5. 🤖 Telegram Notification & Underpaid Error Alert Engine
- **Phát tin đa kênh**: Đồng thời phát tin tới Nhóm Telegram `Techgear` (`-1004294239186`) và Chat Bot.
- **Cảnh báo lỗi chuyển thiếu tiền (Underpaid Alert)**: Tự động phát hiện khi `paidAmount < totalAmount` ➔ Giữ nguyên đơn chưa duyệt ➔ Bắn ngay cảnh báo màu đỏ `⚠️ TECHGEAR PAYMENT ALERT` về Telegram.
- **Đồng bộ lịch sử**: API `POST /payments/sync-history` đồng bộ trực tiếp lịch sử ngân hàng từ SePay v2 REST API.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Thành phần | Công nghệ / Thư viện |
| :--- | :--- |
| **Runtime Environment** | Node.js (v20.x), TypeScript (v5.x) |
| **Web Framework** | Express.js (v4.18) |
| **Database** | MongoDB Atlas (Native Driver / Mongoose) |
| **In-Memory Cache & Queue** | Upstash Redis & BullQueue |
| **Validation Schema** | Zod Schema Validation |
| **Payment Gateway** | SePay Payment Gateway (SDK `sepay-pg-node`) |
| **Alerts & Messaging** | Telegram Bot API (`node-fetch` / `axios`) |
| **Email Service** | Nodemailer & Ethereal / AWS SES |
| **Testing Framework** | Jest, Supertest & Cross-Env |

---

## 📋 CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV)

Tạo file `.env.production` hoặc `.env.development.local` tại thư mục `server/`:

```env
# Server Basic Configs
PORT=3000
HOST="0.0.0.0"
NODE_ENV="production"
CLIENT_URL="https://techgear-frontend.vercel.app"

# Database MongoDB Configs
MONGODB_URI="mongodb+srv://Duykhobo:maycongathibietgi@shoppingcart.whw0gxq.mongodb.net/"
DB_NAME="ShoppingCart"
DB_USERS_COLLECTION="users"
DB_REFRESH_TOKENS_COLLECTION="refresh_tokens"
DB_PRODUCTS_COLLECTION="products"
DB_ORDERS_COLLECTION="orders"
DB_CATEGORIES_COLLECTION="categories"
DB_CARTS_COLLECTION="carts"

# Security Secrets & JWT Tokens
PASSWORD_SECRET="diepdeptrai_prod_sec_99"
JWT_SECRET_ACCESS_TOKEN="prod_jwt_secret_access_key_99"
JWT_SECRET_REFRESH_TOKEN="prod_jwt_secret_refresh_key_99"
JWT_SECRET_EMAIL_VERIFY_TOKEN="prod_jwt_secret_email_key_99"
JWT_SECRET_FORGOT_PASSWORD_TOKEN="prod_jwt_secret_forgot_key_99"

ACCESS_TOKEN_EXPIRE_IN="15m"
REFRESH_TOKEN_EXPIRE_IN="100d"
EMAIL_VERIFY_TOKEN_EXPIRE_IN="7d"
FORGOT_PASSWORD_TOKEN_EXPIRE_IN="7d"

# Email SMTP Configs
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT=587
SMTP_USERNAME="lionel8@ethereal.email"
SMTP_PASSWORD="password"
EMAIL_FROM_ADDRESS="lionel8@ethereal.email"
EMAIL_FROM_NAME="TechGear Support"

# Cloudinary Upload Configs
CLOUDINARY_CLOUD_NAME="dfhvnhk8c"
CLOUDINARY_API_KEY="793336617216367"
CLOUDINARY_API_SECRET="pC3oxG0CRXQR5ldQh3rBCHpH6zk"

# Redis Configs
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_URL="rediss://default:gQAAAAAAAg-MAAIgcDI3YjAzYWEyYmNlODk0ZWNhYjYyZDY5NDc0NTZkMDA3OA@usable-firefly-135052.upstash.io:6379"

# SePay Payment Gateway Configs
SEPAY_ENV="production"
SEPAY_MERCHANT_ID="SP-LIVE-NT588865"
SEPAY_SECRET_KEY="spsk_live_bg8L3Co4xRrcj5V7TPqC94YnY5kFdfWp"
SEPAY_SANDBOX_API_KEY="6EHRSIR3ZMDTS1HU9XKTBV0UXNESFZOUBH2P7WYAP4QZVEFLJJAYLROG3JXQBHDU"
SEPAY_LIVE_API_KEY="H4ZK838Q2JDIMXGQ6AN0M4B3ASXTWPFEU5S11CCEQPRSUMOVKAFJDKN6GXCOVVH9"

# Telegram Bot Configs
TELEGRAM_BOT_TOKEN="8874098441:AAEQET7toAgwEZwRP70lLwElqrawF7glwQg"
TELEGRAM_CHAT_ID="-1004294239186"
```

---

## 🔌 CHI TIẾT DANH SÁCH API ENDPOINTS

### 1. 🔑 Users & Authentication (`/users`)

| Method | Endpoint | Access | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/register` | Public | Đăng ký tài khoản người dùng mới |
| `POST` | `/users/login` | Public | Đăng nhập & trả về cặp JWT Token |
| `POST` | `/users/logout` | Protected | Đăng xuất & vô hiệu hóa RefreshToken |
| `POST` | `/users/refresh-token` | Public | Gia hạn AccessToken mới từ RefreshToken |
| `GET` | `/users/me` | Protected | Lấy thông tin cá nhân của User đăng nhập |
| `PATCH` | `/users/me` | Protected | Cập nhật thông tin cá nhân |

### 2. 📦 Products (`/products`)

| Method | Endpoint | Access | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Lấy danh sách sản phẩm (Phân trang & Lọc) |
| `GET` | `/products/:id` | Public | Lấy thông tin chi tiết 1 sản phẩm |
| `POST` | `/products` | Admin | Tạo mới sản phẩm (Quyền Admin) |
| `PUT` | `/products/:id` | Admin | Cập nhật thông tin sản phẩm (Admin) |
| `DELETE` | `/products/:id` | Admin | Xóa sản phẩm (Admin) |

### 3. 🛒 Cart & Orders (`/carts`, `/orders`)

| Method | Endpoint | Access | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/carts` | Protected | Lấy chi tiết giỏ hàng của User |
| `POST` | `/carts` | Protected | Thêm sản phẩm vào giỏ hàng |
| `PATCH` | `/carts` | Protected | Cập nhật số lượng sản phẩm trong giỏ |
| `POST` | `/orders/checkout` | Protected | Khởi tạo đơn hàng từ giỏ hàng |
| `GET` | `/orders/my-orders` | Protected | Xem lịch sử đơn hàng của tôi |

### 4. 💳 Payments & SePay Webhooks (`/payments`)

| Method | Endpoint | Access | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/sepay/ipn` | Public/SePay | Webhook IPN xử lý thanh toán từ SePay |
| `GET` | `/payments/sepay/ipn` | Public | Status Check Endpoint (Trả về `200 OK`) |
| `POST` | `/payments/sync-history` | Protected | Đồng bộ lịch sử giao dịch SePay v2 REST API |
| `POST` | `/payments/test-telegram` | Protected | Bán thử thông báo Telegram |
| `GET` | `/payments/test-checkout` | Public | Studio UI thử nghiệm checkout SePay |

---

## 💳 XỬ LÝ THANH TOÁN SEPAY VIETQR & WEBHOOK IPN

### Mã QR Tự Động (`generateVietQRUrl`)

Sử dụng hàm tạo URL VietQR Quick Link chuẩn trong `sepay.service.ts`:

```typescript
const qrImageUrl = sePayService.generateVietQRUrl({
  bank: 'Sacombank',
  acc: '070148520060',
  template: 'compact2',
  amount: 500000,
  des: 'INV67aab1234567890123456789',
  holder: 'VO QUOC G',
  store: 'TechGear Store'
})
```

---

## 🧪 HƯỚNG DẪN CHẠY TEST SUITE

Hệ thống đi kèm **8 Bộ Kiểm Thử Tự Động (8 Test Suites / 26 Test Cases)** phủ 100% các chốt chặn nghiệp vụ:

```bash
# Chạy toàn bộ Test Suites
npm run test
```

### Kết Quả Kiểm Thử (Test Execution Report):

```text
PASS tests/products.test.ts
PASS tests/orders.test.ts
PASS tests/cart.test.ts
PASS tests/payments.test.ts
PASS tests/categories.test.ts
PASS tests/auth.test.ts
PASS tests/users.test.ts
PASS tests/health.test.ts

Test Suites: 8 passed, 8 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        42.77 s
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI RENDER / DOCKER

### 1. Chạy Local Development
```bash
git clone https://github.com/Duykhobo/techgear-ecommerce.git
cd techgear-ecommerce/server
npm install --legacy-peer-deps
npm run dev
```

### 2. Triển Khai Lên Render (Render Deployment)
1. Tạo Web Service mới trên Render Dashboard kết nối với GitHub Repository.
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. Copy toàn bộ nội dung file `.env.production` nạp vào mục **Environment Variables** trên Render.

---

## 📄 GIẤY PHÉP & BẢN QUYỀN

Phát triển bởi **TechGear E-Commerce Team**. Được phát hành theo giấy phép **MIT License**.
