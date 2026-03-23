# TechGear E-Commerce — Backend API

REST API backend cho nền tảng thương mại điện tử thiết bị công nghệ, được xây dựng bằng Node.js + Express + TypeScript + MongoDB.

---

## 📋 Mục Lục

- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Cài đặt](#-cài-đặt)
- [Biến môi trường](#-biến-môi-trường)
- [API Endpoints](#-api-endpoints)
- [Kiến trúc dự án](#-kiến-trúc-dự-án)

---

## ✨ Tính Năng

### Authentication
- Đăng ký / Đăng nhập / Đăng xuất
- JWT Access Token + Refresh Token (rotation)
- Xác thực email qua link gửi mail
- Quên mật khẩu & đặt lại mật khẩu
- Gửi lại email xác thực

### Sản phẩm & Danh mục
- CRUD sản phẩm (Admin)
- Lọc theo danh mục, tìm kiếm theo tên, sắp xếp, phân trang
- Soft delete (không xoá vĩnh viễn)
- CRUD danh mục

### Giỏ hàng
- Thêm / cập nhật / xoá sản phẩm trong giỏ
- Kiểm tra tồn kho khi thêm vào giỏ
- Xử lý "ghost product" (sản phẩm đã bị xoá)

### Đơn hàng
- Tạo đơn hàng từ giỏ hàng (MongoDB Transaction)
- Huỷ đơn hàng + hoàn kho tự động
- Admin cập nhật trạng thái đơn
- Thống kê doanh thu theo ngày
- Top sản phẩm bán chạy

### Media
- Upload ảnh lên Cloudinary

---

## 🛠 Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB (Native Driver) |
| Authentication | JWT (Access + Refresh Token) |
| Validation | Zod |
| Password | Bcrypt |
| Email | Nodemailer |
| Media | Cloudinary |
| Logging | Morgan |
| Security | Helmet, CORS |

---

## 🚀 Cài Đặt

### Yêu cầu

- Node.js >= 18
- MongoDB >= 6 (Replica Set để hỗ trợ Transactions)
- Cloudinary account

### Các bước cài đặt

```bash
# 1. Clone repository
git clone <repo-url>
cd techgear-ecommerce/server

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env từ template
cp .env.example .env
# Điền các giá trị vào .env (xem phần Biến môi trường)

# 4. Chạy ở chế độ development
npm run dev
```

### Các lệnh NPM

```bash
npm run dev          # Chạy development server (nodemon + ts-node)
npm run build        # Build production (TypeScript → dist/)
npm run start        # Chạy production server từ dist/
npm run lint         # Kiểm tra lỗi ESLint
npm run lint:fix     # Tự sửa lỗi ESLint
npm run prettier     # Kiểm tra format code
npm run prettier:fix # Tự format code
```

---

## 🔐 Biến Môi Trường

Tạo file `.env` từ `.env.example` và điền đầy đủ các giá trị:

```env
# Server
PORT=8080
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017
DB_NAME=techgear
DB_USERS_COLLECTION=users
DB_REFRESH_TOKENS_COLLECTION=refresh_tokens
DB_PRODUCTS_COLLECTION=products
DB_ORDERS_COLLECTION=orders
DB_CATEGORIES_COLLECTION=categories

# JWT Secrets
JWT_SECRET_ACCESS_TOKEN=your_access_secret
JWT_SECRET_REFRESH_TOKEN=your_refresh_secret
JWT_SECRET_EMAIL_VERIFY_TOKEN=your_email_verify_secret
JWT_SECRET_FORGOT_PASSWORD_TOKEN=your_forgot_password_secret

# Token Expiry
ACCESS_TOKEN_EXPIRE_IN=15m
REFRESH_TOKEN_EXPIRE_IN=7d
EMAIL_VERIFY_TOKEN_EXPIRE_IN=1d
FORGOT_PASSWORD_TOKEN_EXPIRE_IN=1h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

> **Lưu ý:** MongoDB phải chạy dưới dạng **Replica Set** để hỗ trợ Transactions (dùng cho tạo/huỷ đơn hàng).

---

## 📡 API Endpoints

Base URL: `http://localhost:8080/api`

### Auth — `/api/auth`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/auth/register` | Đăng ký tài khoản | ❌ |
| `POST` | `/auth/login` | Đăng nhập | ❌ |
| `POST` | `/auth/logout` | Đăng xuất | ✅ Access |
| `POST` | `/auth/refresh-token` | Làm mới Access Token | 🔄 Refresh |
| `POST` | `/auth/verify-email` | Xác thực email | 🔑 Email Token |
| `POST` | `/auth/resend-verify-email` | Gửi lại email xác thực | ✅ Access |
| `POST` | `/auth/forgot-password` | Yêu cầu đặt lại mật khẩu | ❌ |
| `POST` | `/auth/verify-forgot-password` | Xác thực forgot password token | 🔑 FP Token |
| `POST` | `/auth/reset-password` | Đặt lại mật khẩu | 🔑 FP Token |

### Products — `/api/products`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/products` | Danh sách sản phẩm (filter, sort, paginate) | ❌ |
| `GET` | `/products/:id` | Chi tiết sản phẩm | ❌ |
| `POST` | `/products` | Tạo sản phẩm mới | 🛡️ Admin |
| `PATCH` | `/products/:id` | Cập nhật sản phẩm | 🛡️ Admin |
| `DELETE` | `/products/:id` | Xoá sản phẩm (soft delete) | 🛡️ Admin |

**Query params cho `GET /products`:**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `page` | number | Trang (default: 1) |
| `limit` | number | Số item/trang (default: 10) |
| `category_id` | string | Lọc theo danh mục |
| `name` | string | Tìm kiếm theo tên |
| `sort_by` | string | Trường sắp xếp (e.g., `price`, `created_at`) |
| `order` | `asc`\|`desc` | Chiều sắp xếp |

### Categories — `/api/categories`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/categories` | Danh sách danh mục | ❌ |
| `GET` | `/categories/:id` | Chi tiết danh mục | ❌ |
| `POST` | `/categories` | Tạo danh mục | 🛡️ Admin |
| `PATCH` | `/categories/:id` | Cập nhật danh mục | 🛡️ Admin |
| `DELETE` | `/categories/:id` | Xoá danh mục | 🛡️ Admin |

### Users / Cart — `/api/users`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/users/me/cart` | Xem giỏ hàng | ✅ Access |
| `POST` | `/users/cart` | Thêm sản phẩm vào giỏ | ✅ Access |
| `PATCH` | `/users/cart/:product_id` | Cập nhật số lượng | ✅ Access |
| `DELETE` | `/users/cart/:product_id` | Xoá sản phẩm khỏi giỏ | ✅ Access |

### Orders — `/api/orders`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/orders` | Tạo đơn hàng từ giỏ hàng | ✅ Access |
| `PATCH` | `/orders/:id/cancel` | Huỷ đơn hàng | ✅ Access |
| `PATCH` | `/orders/admin/orders/:id/status` | Cập nhật trạng thái đơn | 🛡️ Admin |
| `GET` | `/orders/admin/analytics/revenue` | Thống kê doanh thu | 🛡️ Admin |
| `GET` | `/orders/admin/analytics/top-products` | Top sản phẩm bán chạy | 🛡️ Admin |

**Query params cho `GET /analytics/revenue`:**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `startDate` | string (ISO) | Từ ngày |
| `endDate` | string (ISO) | Đến ngày |

### Media — `/api/medias`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/medias/upload` | Upload ảnh lên Cloudinary | ✅ Access |

---

## 🏗 Kiến Trúc Dự Án

```
server/
├── src/
│   ├── index.ts                    # Entry point, khởi động Express + DB
│   ├── type.d.ts                   # Global type declarations
│   │
│   ├── common/                     # Shared utilities & infrastructure
│   │   ├── configs/                # Env config, app config
│   │   ├── constants/              # Enums, HTTP status codes, messages
│   │   ├── middlewares/            # Global middlewares (admin check, v.v.)
│   │   ├── models/                 # Error models
│   │   ├── services/               # Database singleton, Email service
│   │   └── utils/                  # JWT, bcrypt, handler wrapper, validation
│   │
│   └── modules/                    # Feature modules
│       ├── auth/                   # Authentication
│       │   ├── auth.controller.ts
│       │   ├── auth.middleware.ts  # JWT validators
│       │   ├── auth.route.ts
│       │   ├── auth.schema.ts      # Zod schemas + TypeScript models
│       │   └── auth.service.ts
│       │
│       ├── products/               # Product management
│       ├── categories/             # Category management
│       ├── orders/                 # Order & analytics
│       ├── users/                  # User cart management
│       └── medias/                 # File upload
│
├── dist/                           # Compiled JavaScript (gitignored)
├── uploads/                        # Temp upload dir
├── .env.example                    # Template biến môi trường
├── package.json
└── tsconfig.json
```

### Quy tắc đặt tên theo module

Mỗi module gồm tối đa 5 file:

| File | Vai trò |
|------|---------|
| `*.controller.ts` | Xử lý request/response |
| `*.service.ts` | Business logic, tương tác DB |
| `*.route.ts` | Khai báo routes + middleware pipeline |
| `*.schema.ts` | Zod validation schemas + TypeScript types/models |
| `*.middleware.ts` | Middleware đặc thù của module |

---

## 🔄 Order Status Flow

```
Pending → Processing → Shipped → Delivered → Completed
   ↓
Cancelled  (chỉ từ trạng thái Pending)
```

---

## 📄 License

ISC
