# 🛒 TechGear E-Commerce Enterprise Platform

[ 🇻🇳 Tiếng Việt ](README_VN.md) | [ 🇬🇧 English ](README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-blue.svg)
![Express](https://img.shields.io/badge/Express-v4.18-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20v7-green.svg)
![SePay](https://img.shields.io/badge/SePay-VietQR--Gateway-orange.svg)
![Telegram](https://img.shields.io/badge/Telegram-Bot--API-blue.svg)
![Build Status](https://img.shields.io/badge/Tests-26%2F26%20Passed-brightgreen.svg)

TechGear E-Commerce là hệ thống bán hàng công nghệ trực tuyến toàn diện được xây dựng theo kiến trúc **Decoupled Backend & Frontend**, hỗ trợ xử lý thanh toán tự động qua **Cổng thanh toán SePay VietQR (Dual Sandbox & Production)** và phát cảnh báo báo động tức thì tới **Telegram Bot API**.

🌐 **Liên Kết Live Demo & Deployment**:
- **Backend Production Base URL**: `https://techgear-backend.onrender.com`
- **Frontend Production Web App**: `https://techgear-frontend.vercel.app`
- **Trình Thử Nghiệm SePay Studio**: `https://techgear-backend.onrender.com/payments/test-checkout`

---

## 1. 📌 Mục Lục

1. [Header & Giới Thiệu Tổng Quan](#-header--giới-thiệu-tổng-quan)
2. [Tính Năng Chính](#-tính-năng-chính)
3. [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
4. [Kiến Trúc Hệ Thống & Cấu Trúc Thư Mục](#-kiến-trúc-hệ-thống--cấu-trúc-thư-mục)
5. [Yêu Cầu Môi Trường](#-yêu-cầu-môi-trường)
6. [Hướng Dẫn Cài Đặt & Chạy Cục Bộ](#-hướng-dẫn-cài-đặt--chạy-cục-bộ)
7. [Kiểm Thử & Chất Lượng Mã Nguồn](#-kiểm-thử--chất-lượng-mã-nguồn)
8. [Tài Liệu API](#-tài-liệu-api)
9. [Tác Giả & Giấy Phép](#-tác-giả--giấy-phép)

---

## 2. ✨ Tính Năng Chính

### 👤 Phân Hệ Khách Hàng (User Flow)
- **Xác Thực & Bảo Mật**: Đăng ký, Đăng nhập, Quên mật khẩu, Tự động gia hạn Token JWT.
- **Duyệt Sản Phẩm**: Lọc theo danh mục, tìm kiếm từ khóa, kiểm tra số lượng tồn kho khả dụng theo thời gian thực.
- **Giỏ Hàng & Checkout**: Thêm/Sửa/Xóa sản phẩm khỏi giỏ, tự động tính tổng tiền & phí vận chuyển.
- **Thanh Toán VietQR Tự Động**: Sinh mã QR động kèm nội dung chuyển khoản `INV<ObjectId>` chuẩn ngân hàng.

### 🛡️ Phân Hệ Quản Trị (Admin Flow)
- **Quản Lý Sản Phẩm & Danh Mục**: CRUD sản phẩm, cập nhật giá, tải ảnh lên Cloudinary, điều chỉnh số lượng tồn kho.
- **Quản Lý Đơn Hàng**: Theo dõi trạng thái đơn hàng theo thời gian thực (`Pending` -> `Paid` -> `Processing`).
- **Đồng Bộ Lịch Sử Ngân Hàng**: 1-click sync toàn bộ lịch sử giao dịch trực tiếp từ SePay REST API v2.

### ⚡ Tính Năng Kỹ Thuật Nổi Bật
- **SePay Dual-Environment**: Tự động chuyển đổi mượt mà giữa **Sandbox (Test)** và **Production (Live)**.
- **Bảo Mật Webhook Signature**: Mã hóa kiểm tra chữ ký HMAC-SHA256 (`X-SePay-Signature` & `X-SePay-Timestamp`).
- **Smart Prefix Regex Matcher**: Tự động nhận diện bóc tách cả 2 tiền tố mã đơn `INV` và `PAY`.
- **Cảnh Báo Lỗi Khẩn Cấp Telegram**: Phát hiện khách chuyển thiếu tiền (`paidAmount < totalAmount`) ➔ Bắn ngay cảnh báo màu đỏ `⚠️ TECHGEAR PAYMENT ALERT` về Telegram.
- **Hàng Đợi Gửi Email Bất Đồng Bộ**: Xử lý gửi email qua BullQueue & Redis không gây nghẽn Server.
- **Idempotency Guard**: Kháng trùng lặp Webhook 100%, không bị trừ tồn kho 2 lần.

---

## 3. 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân loại | Công nghệ / Thư viện | Ý nghĩa & Công dụng |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v20.x), TypeScript (v5.x) | Môi trường thực thi & Mã nguồn định kiểu strict |
| **Web Framework** | Express.js (v4.18) | Framework tạo HTTP RESTful API |
| **Database** | MongoDB Atlas (Native Driver / Mongoose) | Cơ sở dữ liệu NoSQL |
| **Caching & Queue** | Upstash Redis, BullQueue | Cache dữ liệu & Hàng đợi gửi Email |
| **Validation Schema** | Zod Schema Validation | Kiểm tra tính hợp lệ của Payload đầu vào |
| **Payment Gateway** | SePay VietQR (SDK `sepay-pg-node`) | Cổng thanh toán chuyển khoản tự động |
| **Alerts & Messaging**| Telegram Bot API | Phát thông báo đơn mới & cảnh báo lỗi |
| **Storage Service** | Cloudinary | Lưu trữ ảnh sản phẩm trên Cloud |
| **Testing Suite** | Jest, Supertest, Cross-Env | Bộ kiểm thử tích hợp tự động |

---

## 4. 🏛️ Kiến Trúc Hệ Thống & Cấu Trúc Thư Mục

```text
techgear-ecommerce/
├── client/                     # Mã nguồn Frontend Web App (React / Next.js)
├── server/                     # Mã nguồn Backend API (Express / TypeScript)
│   ├── src/
│   │   ├── common/             # Configs, Constants, Middlewares, Queues, Services dùng chung
│   │   │   ├── configs/        # Cấu hình Zod Schema kiểm tra `.env`
│   │   │   ├── constants/      # Định nghĩa Enums & HTTP Status codes
│   │   │   ├── middlewares/    # Error Handlers, Auth & RBAC Checkers
│   │   │   ├── queues/         # BullQueue Email Workers
│   │   │   ├── services/       # Database & Telegram Services
│   │   │   └── utils/          # Logger & Helper utilities
│   │   ├── modules/            # Chia theo từng Domain chức năng
│   │   │   ├── auth/           # Quản lý Đăng ký / Đăng nhập
│   │   │   ├── users/          # Quản lý Thông tin cá nhân
│   │   │   ├── products/       # Quản lý Sản phẩm
│   │   │   ├── categories/     # Quản lý Danh mục
│   │   │   ├── carts/          # Quản lý Giỏ hàng
│   │   │   ├── orders/         # Quản lý Đơn hàng & Checkout
│   │   │   └── payments/       # SePay VietQR Gateway & Webhook Engine
│   │   ├── app.ts              # Khởi tạo Express Application
│   │   └── index.ts            # Entry Point Server
│   ├── tests/                  # 8 Test Suites (26 Test Cases)
│   ├── tsconfig.json           # TypeScript Compiler Options
│   └── package.json            # Thư viện & Scripts
├── README_VN.md                # Tài liệu Tiếng Việt chính thức
└── README.md                   # Tài liệu Tiếng Anh chính thức
```

---

## 5. ⚙️ Yêu Cầu Môi Trường (Prerequisites)

Đảm bảo máy tính của bạn đã cài đặt các công cụ sau trước khi bắt đầu:

- **Node.js**: Phiên bản `>= 18.x` (Khuyến nghị `v20.x LTS`).
- **Package Manager**: `npm` (đi kèm sẵn với Node.js).
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
| `HOST` | IP Lắng nghe mạng | `"0.0.0.0"` |
| `NODE_ENV` | Môi trường hoạt động | `"development"` |
| `MONGODB_URI` | Chuỗi kết nối Mongo Atlas | `mongodb+srv://...` |
| `DB_NAME` | Tên Database Mongo | `"ShoppingCart"` |
| `PASSWORD_SECRET` | Khóa mã hóa mật khẩu | `"your_secret_hash"` |
| `JWT_SECRET_ACCESS_TOKEN` | Khóa AccessToken JWT | `"your_access_secret"` |
| `JWT_SECRET_REFRESH_TOKEN`| Khóa RefreshToken JWT | `"your_refresh_secret"` |
| `SEPAY_ENV` | Môi trường SePay | `"sandbox"` hoặc `"production"` |
| `SEPAY_MERCHANT_ID` | Mã Merchant SePay | `"SP-LIVE-NT588865"` |
| `SEPAY_SECRET_KEY` | Khóa bảo mật Webhook HMAC | `"spsk_live_..."` |
| `TELEGRAM_BOT_TOKEN` | Bot Token từ BotFather | `"8874098441:AAEQ..."` |
| `TELEGRAM_CHAT_ID` | Chat ID Nhóm/Bot | `"-1004294239186"` |

### Bước 4: Chạy Ứng Dụng ở Môi Trường Development
```bash
npm run dev
```
Truy cập trình duyệt: `http://localhost:3000` (hoặc `http://localhost:3000/payments/test-checkout` để vào SePay Studio Tester).

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

| Module | HTTP Method | Endpoint | Quyền Hạn | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/users/register` | Public | Đăng ký tài khoản người dùng mới |
| **Auth** | `POST` | `/users/login` | Public | Đăng nhập & Nhận cặp Token JWT |
| **Auth** | `POST` | `/users/refresh-token` | Public | Gia hạn AccessToken từ RefreshToken |
| **Products** | `GET` | `/products` | Public | Lấy danh sách sản phẩm (Lọc & Phân trang) |
| **Products** | `POST` | `/products` | **Admin** | Tạo sản phẩm mới (Quyền Admin) |
| **Cart** | `POST` | `/carts` | Protected | Thêm sản phẩm vào giỏ hàng |
| **Orders** | `POST` | `/orders/checkout` | Protected | Khởi tạo đơn hàng mới từ giỏ |
| **Payments** | `POST` | `/payments/sepay/ipn` | Public/SePay | Webhook xử lý thanh toán từ SePay |
| **Payments** | `POST` | `/payments/sync-history` | Protected | Đồng bộ lịch sử ngân hàng từ SePay API v2 |

---

## 9. 👨‍💻 Tác Giả & Giấy Phép (Authors & License)

- **Tác giả / Lead Developer**: Duykhobo (TechGear Engineering Team)
- **Email Liên Hệ**: `contact@techgear.com` / `Duykhobo@users.noreply.github.com`
- **Giấy phép (License)**: Được phát hành theo giấy phép **MIT License**.
