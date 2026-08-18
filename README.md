# Pathfinder Backend Server

A scalable, modular, and enterprise-grade backend for the **Pathfinder** career guidance application built with **Node.js, Express, TypeScript, and MongoDB (Mongoose)**.

---

## 🏗 Architecture Overview

The backend uses a **Domain-Driven Modular (Feature-Based)** architecture:

```
server/
├── src/
│   ├── config/             # Zod environment variable validation & MongoDB connection
│   ├── middlewares/        # JWT auth protection, Zod request validator, error handler, rate limiters
│   ├── modules/            # Feature-driven business modules
│   │   ├── auth/           # Registration, Login, Token Refresh
│   │   ├── users/          # Profile retrieval, username search, user updates
│   │   ├── connections/    # Explorer <-> Guide linking & invitations
│   │   └── careers/        # Career pathways, skills matrix & match scoring
│   ├── utils/              # ApiResponse standardizer, AppError, JWT, Bcrypt password tools
│   ├── app.ts              # Express application configuration
│   └── index.ts            # Server entrypoint with graceful shutdown handling
├── .env.example
├── tsconfig.json
└── package.json
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

Default settings:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pathfinder
JWT_ACCESS_SECRET=your_super_secret_access_key_32chars
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_32chars
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Initial Career Roles
Populate the database with initial career pathways (AI Product Engineer, Lead Design Engineer, etc.):
```bash
npm run seed
```

### 4. Run in Development Mode
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### 🟢 System & Health
- `GET /` — API Status
- `GET /api/v1/health` — Service uptime & healthcheck

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new account (Explorer or Guide) | No |
| `POST` | `/api/v1/auth/login` | Login with username/email & password | No |
| `POST` | `/api/v1/auth/refresh` | Refresh expired access token | No |

### 👤 Users (`/api/v1/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Get current authenticated user profile | Yes (`Bearer Token`) |
| `PATCH` | `/api/v1/users/me` | Update profile information | Yes |
| `GET` | `/api/v1/users/search?q=query` | Search users by name/username | Yes |
| `GET` | `/api/v1/users/:username` | Lookup public user profile by username | Yes |

### 🤝 Connections (`/api/v1/connections`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/connections/request` | Send link request to `@username` | Yes |
| `PATCH` | `/api/v1/connections/:connectionId/respond` | Accept or reject connection request | Yes |
| `GET` | `/api/v1/connections/my` | List all active linked accounts | Yes |
| `GET` | `/api/v1/connections/pending` | List incoming pending connection requests | Yes |

### 🧭 Career Pathways (`/api/v1/careers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/careers` | Browse & search career pathways | No |
| `GET` | `/api/v1/careers/:idOrSlug` | Get single career pathway details | No |
| `POST` | `/api/v1/careers` | Create new career pathway | Yes (`Admin`) |

---

## 🛡 Security Best Practices Implemented
- **Zod Schema Validation**: Strict input validation on all routes before reaching controllers.
- **Bcrypt Password Hashing**: Salted passwords with high factor (12 rounds).
- **JWT Token Strategy**: Short-lived access tokens with secure refresh token rotation.
- **Helmet**: Secures HTTP response headers against common web vulnerabilities.
- **HPP**: Protects against HTTP Parameter Pollution attacks.
- **Rate Limiting**: Defends sensitive endpoints (login/register) against brute-force attacks.
- **CORS Protection**: Whitelists trusted frontend origins.
