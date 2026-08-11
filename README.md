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
├── client/                     # Frontend Web App Source Code (Vite + React + TS + Tailwind + Zustand)
│   ├── src/
│   │   ├── api/                # Axios Client Instance with Interceptors & Service Calls
│   │   ├── components/         # Reusable UI Components (Navbar, Footer, ProductCard)
│   │   ├── pages/              # App Pages (HomePage, ProductsPage, CartPage, LoginPage, RegisterPage)
│   │   ├── routes/             # App Router Configuration
│   │   ├── store/              # Zustand Global Stores (Auth & Cart)
│   │   └── types/              # TypeScript Interfaces (Synced with Backend)
│   ├── vite.config.ts          # Vite Configuration with API Proxy to http://localhost:3000
│   └── package.json            # Frontend Dependencies & Scripts
├── server/                     # Backend API Server (Express + TypeScript + MongoDB + Redis)
│   ├── postman/                # Postman API Collections & Environment Files
│   ├── src/
│   │   ├── common/             # Middlewares, Configs, Redis, Queues, Services
│   │   ├── modules/            # Auth, Users, Products, Categories, Cart, Orders, Payments
│   │   └── index.ts            # Server Entry Point
│   ├── tests/                  # Integration Test Suites (26 Test Cases)
│   └── package.json            # Backend Dependencies & Scripts
└── README.md                   # Main Project Documentation
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
cd techgear-ecommerce
```

### Step 2: Start Backend API (`server`)
```bash
cd server
npm install --legacy-peer-deps
npm run dev
```
Backend API will run at `http://localhost:3000`.

### Step 3: Start Frontend App (`client`)
In a new terminal tab:
```bash
cd client
npm install
npm run dev
```
Frontend App will run at `http://localhost:5173`. Proxies `/api` requests to `http://localhost:3000`.

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
- **GitHub Profile**: [https://github.com/Duykhobo](https://github.com/Duykhobo)
- **Support / Issues**: [TechGear Issues Page](https://github.com/Duykhobo/techgear-ecommerce/issues)
- **License**: Released under the **MIT License** (See [LICENSE](LICENSE) file).
