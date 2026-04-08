<<<<<<< HEAD
# MERN + MySQL Authentication & CRUD Dashboard

A full-stack application with **user authentication** (register, login, forgot/reset password) and a **dashboard with full CRUD** operations, built with:

- **Frontend**: React (Vite) + Tailwind CSS + Axios + Context API
- **Backend**: Node.js + Express.js + MySQL (mysql2) + JWT + bcryptjs + Nodemailer

---

## 📁 Project Structure

```
mern-mysql-auth-crud/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Forgot/Reset Password
│   │   └── itemController.js      # CRUD + Stats
│   ├── middleware/
│   │   ├── auth.js                # JWT verification middleware
│   │   └── errorHandler.js        # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── itemRoutes.js          # /api/items/* and /api/stats
│   ├── .env.example
│   ├── .gitignore
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           # Axios instance + interceptors
│   │   │   ├── authApi.js         # Auth API calls
│   │   │   └── itemApi.js         # Item CRUD API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx      # Main dashboard with CRUD + Stats
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── PublicRoute.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── database.sql                   # Full MySQL schema
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MySQL Server 8.0+
- npm or yarn

---

## 🗄️ Step 1: MySQL Database Setup

### Option A: Using MySQL CLI
```bash
mysql -u root -p < database.sql
```

### Option B: Using MySQL Workbench / phpMyAdmin
1. Open your MySQL client
2. Run the contents of `database.sql`
3. Verify: `SHOW TABLES;` should show `users` and `items`

---

## 🔧 Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

### Edit `.env` — fill in your values:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=mern_auth_db

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d

# Gmail: create an App Password at https://myaccount.google.com/apppasswords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=noreply@yourapp.com

CLIENT_URL=http://localhost:5173
```

```bash
# Start backend (with auto-reload)
npm run dev
```

Backend runs at: **http://localhost:5000**

---

## 💻 Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🚀 Running Both Together

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Send reset email | No |
| POST | `/api/auth/reset-password` | Reset with token | No |

### Items (`/api/items`) — All Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items for logged-in user |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| GET | `/api/items/stats` | Get stats (total/active/pending/completed) |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }

Response: { "success": true, "token": "...", "user": { "id": 1, "name": "John Doe", ... } }
```

**Create Item:**
```json
POST /api/items
Headers: { "Authorization": "Bearer <token>" }
{ "title": "My Task", "description": "Details here", "status": "active" }
```

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- **JWT tokens** with configurable expiry
- **Parameterized queries** throughout — SQL injection prevention
- Password reset tokens expire in **1 hour**
- Token stored in **localStorage** with auto-logout on 401
- CORS configured to only allow frontend origin

---

## 🎨 Features

- ✅ User Registration & Login
- ✅ JWT-based authentication with auto token injection
- ✅ Forgot password via email link
- ✅ Reset password with expiring token
- ✅ Protected routes (redirect if not authenticated)
- ✅ Dashboard with live stats (Total / Active / Pending / Completed)
- ✅ Create, Read, Update, Delete items
- ✅ Quick status update per item
- ✅ Delete confirmation modal
- ✅ Loading states on all async operations
- ✅ Error and success alert messages
- ✅ Responsive design (mobile + desktop)
- ✅ Auto logout on expired token

---

## 📧 Email Setup (Password Reset)

For Gmail, create an **App Password**:
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to **App Passwords** → Generate for "Mail"
4. Use that 16-character password as `EMAIL_PASS` in your `.env`

---

## 🛠️ Common Issues

| Issue | Fix |
|-------|-----|
| `MySQL Connection Error` | Check DB credentials in `.env`, ensure MySQL is running |
| `CORS error` | Ensure `CLIENT_URL` in backend `.env` matches your frontend port |
| `Token failed` | JWT_SECRET mismatch — use same value throughout |
| Email not sending | Check Gmail App Password; enable "Less secure apps" or use App Password |
| `ER_DUP_ENTRY` | Email already registered — use a different email |

---

## 📤 GitHub Push Checklist

- [ ] `.gitignore` includes `.env` and `node_modules/`
- [ ] No real credentials committed
- [ ] `database.sql` included
- [ ] `README.md` complete
- [ ] Repository is **PUBLIC**
=======
# mern-mysql-auth-crud
>>>>>>> b5d9cca94400271067e6f7e2cb00088747137f53
