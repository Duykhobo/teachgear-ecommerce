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

TechGear Backend is an enterprise-grade RESTful API server powering the TechGear E-Commerce platform. Built with **Node.js, TypeScript, Express, MongoDB Atlas, Upstash Redis, BullQueue**, it seamlessly integrates automated bank transfers via **SePay VietQR Gateway** and emergency security alert messaging via **Telegram Bot API**.

---

## 1. 📌 Table of Contents

1. [Key Features](#-key-features)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Folder Structure](#-folder-structure)
4. [Environment Variables Guide](#-environment-variables-guide)
5. [API Endpoints Reference](#-api-endpoints-reference)
6. [SePay VietQR Payment Gateway Engine](#-sepay-vietqr-payment-gateway-engine)
7. [Telegram Emergency Alert System](#-telegram-emergency-alert-system)
8. [Automated Test Execution](#-automated-test-execution)
9. [Deployment Guide](#-deployment-guide)

---

## 2. ✨ Key Features

- 🔑 **Dual JWT Token Authentication**: Access Tokens (15m) & Refresh Tokens (100d) with Bcrypt password hashing.
- 🛡️ **Role-Based Access Control (RBAC)**: Secure admin-only routes for inventory management and product CRUD operations.
- 🛒 **Order & Inventory Stock Guard**: Automatic item quantity validation and stock deduction upon successful payment.
- 💳 **SePay VietQR Gateway Engine**:
  - Runtime environment switching between Sandbox & Production.
  - Security signature verification (`X-SePay-Signature` HMAC-SHA256).
  - Regex invoice matcher supporting both `INV` and `PAY` prefixes.
  - Idempotent Webhook IPN event processor preventing double deductions.
- 🤖 **Telegram Alert System**: Instant notification dispatch for new orders and underpaid error alerts (`⚠️ TECHGEAR PAYMENT ALERT`).
- 📧 **Async Job Queue**: Background email processing powered by Redis BullQueue.

---

## 3. 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js v20 LTS, TypeScript v5
- **Framework**: Express v4.18
- **Database**: MongoDB Atlas (Native Driver / Mongoose)
- **Cache & Queue**: Upstash Redis & BullQueue
- **Security & Validation**: Zod Schema, Bcrypt, JsonWebToken
- **Testing**: Jest, Supertest

---

## 4. 📁 Folder Structure

```text
server/
├── src/
│   ├── common/                 # Shared Configs, Constants, Middlewares, Queues, Services
│   │   ├── configs/            # Zod `.env` Validation Schema
│   │   ├── constants/          # Enums & HTTP Status Codes
│   │   ├── middlewares/        # Auth Checkers & Error Handlers
│   │   ├── queues/             # BullQueue Email Workers
│   │   ├── services/           # MongoDB & Telegram Services
│   │   └── utils/              # Logger Utilities
│   ├── modules/                # Feature Domain Modules
│   │   ├── auth/               # Registration & Login Logic
│   │   ├── users/              # User Profile Management
│   │   ├── products/           # Product Catalog API
│   │   ├── categories/         # Product Categories API
│   │   ├── carts/              # Shopping Cart Logic
│   │   ├── orders/             # Checkout & Order Processing
│   │   └── payments/           # SePay VietQR Engine & Webhooks
│   ├── app.ts                  # Express App Setup
│   └── index.ts                # Server Entry Point
├── tests/                      # 8 Integration Test Suites (26 Test Cases)
└── package.json                # Server Dependencies & Scripts
```

---

## 5. ⚙️ Environment Variables Guide

Create `.env.development.local` or `.env.production` inside `server/`:

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

## 6. 🔌 API Endpoints Reference

| Category | Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/users/register` | Public | Register new user account |
| **Auth** | `POST` | `/users/login` | Public | Authenticate user & return JWT tokens |
| **Auth** | `POST` | `/users/refresh-token` | Public | Obtain new AccessToken using RefreshToken |
| **Products** | `GET` | `/products` | Public | Get product list with pagination & filters |
| **Products** | `POST` | `/products` | Admin | Create product item (Admin Only) |
| **Orders** | `POST` | `/orders/checkout` | User | Checkout shopping cart into order |
| **Payments** | `POST` | `/payments/sepay/ipn` | Public/SePay | Webhook handler for SePay IPN notifications |
| **Payments** | `POST` | `/payments/sync-history` | Admin | Sync transaction history from SePay v2 REST API |

### 6.1 📬 Postman Collections & Import Guide
Postman collection and environment files are stored in [`server/postman/`](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/techgear-ecommerce/server/postman):
- `TechGear_Postman_Collection.json`: Full API Request Collection.
- `TechGear_Postman_Environment.json`: Base Environment Variables.
- `techgear_postman_admin_env.json`, `techgear_postman_user_env.json`: Preset tokens for Admin/User roles.

**Import Steps**:
1. Open Postman -> Click **Import**.
2. Drag and drop all files from `server/postman/`.
3. Select the desired environment (`TechGear Admin` or `TechGear User`) in Postman dropdown and start testing!

---

## 7. 🧪 Automated Test Execution

Run the full integration test suite:

```bash
# Execute Jest test suite
npm run test

# Perform TypeScript build check
npm run build
```

---

## 8. 📄 License

MIT License. Developed for TechGear E-Commerce Platform.
