# 🛒 TechGear E-Commerce Enterprise Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-blue.svg)
![Express](https://img.shields.io/badge/Express-v4.18-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20v7-green.svg)
![SePay](https://img.shields.io/badge/SePay-VietQR--Gateway-orange.svg)
![Telegram](https://img.shields.io/badge/Telegram-Bot--API-blue.svg)
![Build Status](https://img.shields.io/badge/Tests-26%2F26%20Passed-brightgreen.svg)

TechGear E-Commerce là hệ thống bán hàng công nghệ trực tuyến toàn diện được xây dựng theo kiến trúc **Decoupled Backend & Frontend**, hỗ trợ xử lý thanh toán tự động qua **Cổng thanh toán SePay VietQR (Dual Sandbox & Production)** và phát cảnh báo báo động tức thì tới **Telegram Bot API**.

🌐 **Live Demo & Deployment Links**:
- **Backend Production Base URL**: `https://techgear-backend.onrender.com`
- **Frontend Production Web App**: `https://techgear-frontend.vercel.app`
- **Interactive SePay Studio Tester**: `https://techgear-backend.onrender.com/payments/test-checkout`

---

## 2. ✨ Tính Năng Chính (Key Features)

### 👤 Phân Hệ Khách Hàng (User Flow)
- **Xác thực & Bảo mật**: Đăng ký, Đăng nhập, Quên mật khẩu, Refresh Token tự động.
- **Duyệt Sản Phẩm**: Lọc danh mục, tìm kiếm từ khóa, xem chi tiết sản phẩm và tồn kho.
- **Giỏ Hàng & Checkout**: Thêm/Sửa/Xóa sản phẩm khỏi giỏ, tự động tính tổng tiền & phí vận chuyển.
- **Thanh Toán VietQR Tự Động**: Tạo mã QR động với nội dung `INV<ObjectId>` chuẩn ngân hàng.

### 🛡️ Phân Hệ Quản Trị (Admin Flow)
- **Quản lý Sản Phẩm & Danh Mục**: CRUD sản phẩm, cập nhật giá, hình ảnh Cloudinary, số lượng tồn kho.
- **Quản lý Đơn Hàng**: Theo dõi trạng thái đơn hàng (`Pending` -> `Paid` -> `Processing`).
- **Đồng Bộ Lịch Sử Ngân Hàng**: 1-click sync toàn bộ lịch sử giao dịch từ SePay REST API v2.

### ⚡ Tính Năng Kỹ Thuật Nổi Bật (Technical Features)
- **SePay Dual-Environment**: Tự động chuyển đổi giữa **Sandbox (Test)** và **Production (Live)**.
- **Bảo Mật Webhook Signature**: HMAC-SHA256 verification (`X-SePay-Signature` & `X-SePay-Timestamp`).
- **Regex Matcher Thông Minh**: Tự động nhận diện cả 2 tiền tố mã đơn `INV` và `PAY`.
- **Cảnh Báo Lỗi Khẩn Cấp Telegram**: Phát hiện khách chuyển thiếu tiền ➔ Bắn ngay cảnh báo màu đỏ `⚠️ TECHGEAR PAYMENT ALERT`.
- **Hàng Đợi Gửi Email (BullQueue + Redis)**: Xử lý bất đồng bộ email xác nhận đơn hàng.
- **Idempotency Guard**: Kháng trùng lặp Webhook 100%, không bị trừ tồn kho lần 2.

---

## 3. 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân loại | Công nghệ / Thư viện | Công dụng |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v20.x), TypeScript (v5.x) | Môi trường thực thi & Mã nguồn typed |
| **Web Framework** | Express.js (v4.18) | Framework HTTP RESTful API |
| **Database** | MongoDB Atlas (Native Driver / Mongoose) | Cơ sở dữ liệu NoSQL |
| **Caching & Queue** | Upstash Redis, BullQueue | Cache dữ liệu & Hàng đợi gửi Email |
| **Validation Schema** | Zod Schema Validation | Kiểm tra tính hợp lệ của Payload |
| **Payment Gateway** | SePay VietQR (SDK `sepay-pg-node`) | Cổng thanh toán ngân hàng tự động |
| **Alerts & Messaging**| Telegram Bot API | Phát thông báo đơn mới & cảnh báo lỗi |
| **Storage Service** | Cloudinary | Lưu trữ ảnh sản phẩm Cloud |
| **Testing Tools** | Jest, Supertest, Cross-Env | Kiểm thử tích hợp tự động |

---

## 4. 🏛️ Kiến Trúc Hệ Thống & Cấu Trúc Thư Mục (Architecture & Folder Structure)

```text
techgear-ecommerce/
├── client/                     # Mã nguồn Frontend (React / Next.js)
├── server/                     # Mã nguồn Backend API (Express / TypeScript)
│   ├── src/
│   │   ├── common/             # Configs, Constants, Middlewares, Queues, Services
│   │   │   ├── configs/        # Cấu hình Zod Schema `.env`
│   │   │   ├── constants/      # Enums, HTTP Status codes
│   │   │   ├── middlewares/    # Error Handlers, Auth & RBAC Checkers
│   │   │   ├── queues/         # BullQueue Email Workers
│   │   │   ├── services/       # Database & Telegram Services
│   │   │   └── utils/          # Logger & Helper utilities
│   │   ├── modules/            # Chia theo từng Domain (Feature Modules)
│   │   │   ├── auth/           # Quản lý Đăng ký / Đăng nhập
│   │   │   ├── users/          # Quản lý Thông tin cá nhân
│   │   │   ├── products/       # Quản lý Sản phẩm
│   │   │   ├── categories/     # Quản lý Danh mục
│   │   │   ├── carts/          # Quản lý Giỏ hàng
│   │   │   ├── orders/         # Quản lý Đơn hàng
│   │   │   └── payments/       # SePay VietQR Gateway Engine & Webhook
│   │   ├── app.ts              # Khởi tạo Express App & Routes Register
│   │   └── index.ts            # Entry Point Server
│   ├── tests/                  # 8 Test Suites (26 Test Cases)
│   ├── tsconfig.json           # Cấu hình TypeScript Compiler
│   └── package.json            # Dependencies & Scripts
└── README.md                   # Tài liệu hướng dẫn chính của dự án
```

---

## 5. ⚙️ Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu cài đặt, đảm bảo máy tính của bạn đã cài sẵn:

- **Node.js**: Phiên bản `>= 18.x` (Khuyến nghị `v20.x LTS`).
- **Package Manager**: `npm` (đi kèm Node.js).
- **MongoDB**: Chuỗi kết nối MongoDB Atlas URI.
- **Redis Cloud**: Upstash Redis hoặc Redis Local (Port `6379`).
- **SePay Credentials**: Merchant ID & Secret Key (Sandbox hoặc Live).
- **Telegram Bot**: Token từ `@BotFather` & Chat ID nhóm.

---

## 6. 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### Bước 1: Clone Mã Nguồn
```bash
git clone https://github.com/Duykhobo/techgear-ecommerce.git
cd techgear-ecommerce/server
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install --legacy-peer-deps
```

### Bước 3: Cấu Hình Biến Môi Trường (`.env`)
Tạo file `.env.development.local` trong thư mục `server/`:

| Biến Môi Trường | Ý Nghĩa / Mục Đích | Mẫu Giá Trị |
| :--- | :--- | :--- |
| `PORT` | Cổng HTTP Server | `3000` |
| `HOST` | IP Lắng nghe | `"0.0.0.0"` |
| `NODE_ENV` | Môi trường hoạt động | `"development"` |
| `MONGODB_URI` | Chuỗi kết nối Mongo Atlas | `mongodb+srv://...` |
| `DB_NAME` | Tên Database Mongo | `"ShoppingCart"` |
| `PASSWORD_SECRET` | Khóa mã hóa mật khẩu | `"your_secret_hash"` |
| `JWT_SECRET_ACCESS_TOKEN` | Khóa AccessToken JWT | `"your_access_secret"` |
| `JWT_SECRET_REFRESH_TOKEN`| Khóa RefreshToken JWT | `"your_refresh_secret"` |
| `SEPAY_ENV` | Môi trường SePay | `"sandbox"` hoặc `"production"` |
| `SEPAY_MERCHANT_ID` | Mã Merchant SePay | `"SP-LIVE-NT588865"` |
| `SEPAY_SECRET_KEY` | Khóa bảo mật Webhook | `"spsk_live_..."` |
| `TELEGRAM_BOT_TOKEN` | Bot Token từ BotFather | `"8874098441:AAEQ..."` |
| `TELEGRAM_CHAT_ID` | Chat ID Nhóm/Bot | `"-1004294239186"` |

### Bước 4: Chạy Ứng Dụng ở Môi Trường Development
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000` (hoặc `http://localhost:3000/payments/test-checkout` để vào SePay Studio Tester).

---

## 7. 🧪 Kiểm Thử & Chất Lượng Mã Nguồn (Testing & Quality)

Dự án đi kèm **8 Bộ Kiểm Thử Tự Động (26/26 Test Cases Passed 100%)**:

```bash
# Chạy toàn bộ Test Suites
npm run test

# Biên dịch kiểm tra lỗi TypeScript (Production Build Test)
npm run build
```

---

## 8. 🔌 Tài Liệu API (API Documentation)

### 📑 Tóm Tắt Danh Sách API Endpoints Chính

| Module | HTTP Method | Endpoint | Quyền Hạn | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/users/register` | Public | Đăng ký tài khoản người dùng mới |
| **Auth** | `POST` | `/users/login` | Public | Đăng nhập & Nhận cặp Token JWT |
| **Auth** | `POST` | `/users/refresh-token` | Public | Gia hạn AccessToken từ RefreshToken |
| **Products** | `GET` | `/products` | Public | Lấy danh sách sản phẩm (Lọc & Phân trang) |
| **Products** | `POST` | `/products` | **Admin** | Tạo sản phẩm mới (Quyền Admin) |
| **Cart** | `POST` | `/carts` | Protected | Thêm sản phẩm vào giỏ hàng |
| **Orders** | `POST` | `/orders/checkout` | Protected | Khởi tạo đơn hàng từ giỏ |
| **Payments** | `POST` | `/payments/sepay/ipn` | Public/SePay | Webhook nhận tín hiệu thanh toán từ SePay |
| **Payments** | `POST` | `/payments/sync-history` | Protected | Đồng bộ lịch sử ngân hàng từ SePay API v2 |

---

## 9. 👨‍💻 Tác Giả & Giấy Phép (Authors & License)

- **Tác giả / Lead Developer**: Duykhobo (TechGear Engineering Team)
- **Email Liên Hệ**: `contact@techgear.com` / `Duykhobo@users.noreply.github.com`
- **Giấy phép (License)**: Được phát hành theo giấy phép **MIT License**.
