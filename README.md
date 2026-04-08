# 🔐 MERN + MySQL Auth & CRUD Dashboard

A production-ready full-stack web application featuring **JWT authentication** and a **dashboard with full CRUD operations**, built with the MERN stack using MySQL as the relational database.


---

## 🖥️ Live Features

- ✅ User Registration & Login
- ✅ JWT-based Authentication (auto token inject + auto logout)
- ✅ Forgot Password via Email Link
- ✅ Reset Password with Expiring Token (1 hour)
- ✅ Protected & Public Routes
- ✅ Dashboard with Live Stats (Total / Active / Pending / Completed)
- ✅ Create, Read, Update, Delete items
- ✅ Quick Status Update per item
- ✅ Delete Confirmation Modal
- ✅ Loading states, Error & Success alerts
- ✅ Fully Responsive (Mobile + Desktop)

---

## 🧰 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 (Vite), Tailwind CSS, Axios    |
| Backend   | Node.js, Express.js                     |
| Database  | MySQL 8 (mysql2, raw SQL, no ORM)       |
| Auth      | JWT (jsonwebtoken), bcryptjs            |
| Email     | Nodemailer (Gmail SMTP)                 |
| Routing   | React Router v6                         |
| State     | React Context API                       |

---

## 📁 Project Structure

```
mern-mysql-auth-crud/
├── backend/
│   ├── config/db.js               # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Forgot/Reset Password
│   │   └── itemController.js      # CRUD + Stats
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   └── errorHandler.js        # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── itemRoutes.js          # /api/items/*
│   ├── .env.example
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/                   # Axios instance + API functions
│       ├── context/               # AuthContext (global auth state)
│       ├── components/            # All pages and route guards
│       ├── App.jsx                # Router setup
│       └── index.css              # Tailwind + custom classes
├── database.sql                   # Full MySQL schema
└── README.md
```

---

## ⚙️ Local Setup Guide

### Prerequisites
- Node.js v18+
- MySQL Server 8.0+
- npm

---

### Step 1 — MySQL Database

```bash
# Option A: via terminal
mysql -u root -p < database.sql

# Option B: open database.sql in MySQL Workbench or phpMyAdmin and run it
```

Verify:
```sql
USE mern_auth_db;
SHOW TABLES;
-- Should show: users, items
```

---

### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mern_auth_db

JWT_SECRET=your_long_random_secret_key
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com

CLIENT_URL=http://localhost:5173
```

> **Gmail App Password:** Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → Generate for "Mail"

```bash
npm run dev
# Backend running at http://localhost:5000
```

---

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Send reset email | No |
| POST | `/api/auth/reset-password` | Reset with token | No |

### Item Endpoints (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items for logged-in user |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| GET | `/api/items/stats` | Get stats summary |

### Example Request — Create Item

```json
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete assignment",
  "description": "Submit before deadline",
  "status": "active"
}
```

---

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(100) NOT NULL UNIQUE,
  phone             VARCHAR(20),
  password          VARCHAR(255) NOT NULL,
  reset_token       VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME    DEFAULT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items
CREATE TABLE items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      ENUM('active','pending','completed') DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔒 Security Highlights

- Passwords hashed with **bcryptjs** (10 salt rounds)
- All SQL queries use **parameterized statements** (no SQL injection)
- JWT tokens with configurable expiry
- Password reset tokens expire in **1 hour**
- CORS restricted to frontend origin only
- `.env` never committed to Git

---

## 📸 Screenshots

> Add your screenshots to the `/screenshots` folder and update paths below

| Page | Preview |
|------|---------|
| Login | `screenshots/login.png` |
| Register | `screenshots/register.png` |
| Dashboard | `screenshots/dashboard.png` |
| Add Item | `screenshots/add-item.png` |
| Edit Item | `screenshots/edit-item.png` |
| Delete Confirm | `screenshots/delete-confirm.png` |
| Forgot Password | `screenshots/forgot-password.png` |
| Reset Password | `screenshots/reset-password.png `
| MySQL Tables | `screenshots/mysql-tables.png` |

---

## 👨‍💻 Author

Gowda Jahnavi Nagesh



