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

TechGear E-Commerce is an enterprise-grade online tech retail platform built with a **Decoupled Backend & Frontend Architecture**. It features automated bank transfers via the **SePay VietQR Payment Gateway (Dual Sandbox & Production)** and instant security alert dispatches via the **Telegram Bot API**.

🌐 **Live Demo & Deployment Links**:
- **Backend Production Base URL**: `https://techgear-backend.onrender.com`
- **Frontend Production Web App**: `https://techgear-frontend.vercel.app`
- **Interactive SePay Studio Tester**: `https://techgear-backend.onrender.com/payments/test-checkout`

---

## 1. 📌 Table of Contents

1. [Header & Overview](#-header--overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [System Architecture & Folder Structure](#-system-architecture--folder-structure)
5. [Prerequisites](#-prerequisites)
6. [Getting Started & Local Development](#-getting-started--local-development)
7. [Testing & Code Quality](#-testing--code-quality)
8. [API Documentation](#-api-documentation)
9. [Authors & License](#-authors--license)

---

## 2. ✨ Key Features

### 👤 Customer Subsystem (User Flow)
- **Authentication & Security**: Registration, Login, Forgot Password, Automatic Token Refreshing.
- **Product Browsing**: Category filtering, keyword search, real-time stock availability check.
- **Cart & Checkout**: Add/Edit/Remove items, dynamic calculation of item totals & shipping fees.
- **Automated VietQR Payments**: Dynamic QR code generation with bank-compliant `INV<ObjectId>` descriptions.

### 🛡️ Management Subsystem (Admin Flow)
- **Product & Category Management**: Full CRUD operations, pricing updates, Cloudinary image uploads, stock adjustments.
- **Order Processing**: Real-time status tracking (`Pending` -> `Paid` -> `Processing`).
- **Bank History Synchronization**: 1-click transaction history sync via SePay REST API v2.

### ⚡ Technical Features
- **SePay Dual-Environment**: Seamless runtime switching between **Sandbox (Test)** and **Production (Live)** modes.
- **Webhook Signature Verification**: HMAC-SHA256 checksum validation (`X-SePay-Signature` & `X-SePay-Timestamp`).
- **Smart Prefix Regex Matcher**: Automatic regex matching supporting both `INV` and `PAY` order invoice prefixes.
- **Telegram Emergency Underpaid Alert**: Detects underpaid transfers (`paidAmount < totalAmount`) and sends an instant red alert warning (`⚠️ TECHGEAR PAYMENT ALERT`).
- **Asynchronous Email Queue**: Powered by BullQueue & Redis for non-blocking email delivery.
- **Idempotency Guard**: 100% duplicate Webhook protection preventing double stock deduction.

---

## 3. 🛠️ Tech Stack

| Category | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v20.x), TypeScript (v5.x) | Execution runtime & strongly typed codebase |
| **Web Framework** | Express.js (v4.18) | HTTP RESTful API Framework |
| **Database** | MongoDB Atlas (Native Driver / Mongoose) | NoSQL Data Persistence |
| **Caching & Queue** | Upstash Redis, BullQueue | Data Caching & Async Email Job Queue |
| **Validation Schema** | Zod Schema Validation | Strict Payload Request Validation |
| **Payment Gateway** | SePay VietQR (SDK `sepay-pg-node`) | Automated Bank Transfer Gateway |
| **Alerts & Messaging**| Telegram Bot API | Instant Order & Error Notification Alerts |
| **Storage Service** | Cloudinary | Cloud Image Asset Hosting |
| **Testing Suite** | Jest, Supertest, Cross-Env | Automated Integration Testing |

---

## 4. 🏛️ System Architecture & Folder Structure

```text
techgear-ecommerce/
├── client/                     # Frontend Web App Source Code (React / Next.js)
├── server/                     # Backend API Source Code (Express / TypeScript)
│   ├── src/
│   │   ├── common/             # Shared Configs, Constants, Middlewares, Queues, Services
│   │   │   ├── configs/        # Zod Schema `.env` validation
│   │   │   ├── constants/      # Enums & HTTP Status codes
│   │   │   ├── middlewares/    # Error Handlers, Auth & RBAC Checkers
│   │   │   ├── queues/         # BullQueue Email Workers
│   │   │   ├── services/       # Database & Telegram Services
│   │   │   └── utils/          # Logger & Helper utilities
│   │   ├── modules/            # Domain Feature Modules
│   │   │   ├── auth/           # Authentication Logic
│   │   │   ├── users/          # Profile & User Management
│   │   │   ├── products/       # Product Catalog
│   │   │   ├── categories/     # Category Management
│   │   │   ├── carts/          # Cart Management
│   │   │   ├── orders/         # Order & Checkout Flow
│   │   │   └── payments/       # SePay VietQR Gateway & Webhook Engine
│   │   ├── app.ts              # Express Application Initialization
│   │   └── index.ts            # Server Entry Point
│   ├── tests/                  # 8 Test Suites (26 Test Cases)
│   ├── tsconfig.json           # TypeScript Compiler Options
│   └── package.json            # Dependencies & Scripts
├── README_VN.md                # Vietnamese Project Documentation
└── README.md                   # Main English Documentation
```

---

## 5. ⚙️ Prerequisites

Ensure the following tools are installed on your machine before setup:

- **Node.js**: Version `>= 18.x` (Recommended: `v20.x LTS`).
- **Package Manager**: `npm` (included with Node.js).
- **MongoDB**: MongoDB Atlas Connection URI string.
- **Redis Cloud**: Upstash Redis or Local Redis instance (Port `6379`).
- **SePay Credentials**: Merchant ID & Secret Key (Sandbox or Live).
- **Telegram Bot**: Bot Token from `@BotFather` & Group Chat ID.

---

## 6. 🚀 Getting Started & Local Development

### Step 1: Clone Repository
```bash
git clone https://github.com/Duykhobo/techgear-ecommerce.git
cd techgear-ecommerce/server
```

### Step 2: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 3: Configure Environment Variables (`.env`)
Create `.env.development.local` in `server/`:

| Environment Variable | Description | Sample Value |
| :--- | :--- | :--- |
| `PORT` | HTTP Server Port | `3000` |
| `HOST` | Binding Network Host | `"0.0.0.0"` |
| `NODE_ENV` | Environment Mode | `"development"` |
| `MONGODB_URI` | Mongo Atlas URI Connection | `mongodb+srv://...` |
| `DB_NAME` | Mongo Database Name | `"ShoppingCart"` |
| `PASSWORD_SECRET` | Password Hashing Secret | `"your_secret_hash"` |
| `JWT_SECRET_ACCESS_TOKEN` | Access Token Secret | `"your_access_secret"` |
| `JWT_SECRET_REFRESH_TOKEN`| Refresh Token Secret | `"your_refresh_secret"` |
| `SEPAY_ENV` | SePay Environment Mode | `"sandbox"` or `"production"` |
| `SEPAY_MERCHANT_ID` | SePay Merchant ID | `"SP-LIVE-NT588865"` |
| `SEPAY_SECRET_KEY` | Webhook HMAC Secret Key | `"spsk_live_..."` |
| `TELEGRAM_BOT_TOKEN` | Bot Token from BotFather | `"8874098441:AAEQ..."` |
| `TELEGRAM_CHAT_ID` | Group / Chat ID | `"-1004294239186"` |

### Step 4: Run Application in Development Mode
```bash
npm run dev
```
Access in browser: `http://localhost:3000` (or `http://localhost:3000/payments/test-checkout` for SePay Studio Tester).

---

## 7. 🧪 Testing & Code Quality

The repository includes **8 Automated Test Suites (26/26 Test Cases Passed 100%)**:

```bash
# Run all test suites
npm run test

# Compile TypeScript production build
npm run build
```

---

## 8. 🔌 API Documentation Summary

| Module | HTTP Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/users/register` | Public | Register new user account |
| **Auth** | `POST` | `/users/login` | Public | User login & issue JWT token pair |
| **Auth** | `POST` | `/users/refresh-token` | Public | Obtain new AccessToken using RefreshToken |
| **Products** | `GET` | `/products` | Public | Fetch product list with filters & pagination |
| **Products** | `POST` | `/products` | **Admin** | Create new product (Admin Only) |
| **Cart** | `POST` | `/carts` | Protected | Add product item to cart |
| **Orders** | `POST` | `/orders/checkout` | Protected | Checkout cart into a new order |
| **Payments** | `POST` | `/payments/sepay/ipn` | Public/SePay | Webhook handler for SePay IPN events |
| **Payments** | `POST` | `/payments/sync-history` | Protected | Sync bank history via SePay API v2 |

---

## 9. 👨‍💻 Authors & License

- **Author / Lead Developer**: Duykhobo (TechGear Engineering Team)
- **Contact Email**: `contact@techgear.com` / `Duykhobo@users.noreply.github.com`
- **License**: Released under the **MIT License**.
