# 💰 Personal Finance Tracker — Full Stack Guide

## Table of Contents
1. [Project Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Backend Setup (Node + Express + MongoDB)](#backend-setup)
6. [Frontend Setup (React + Tailwind)](#frontend-setup)
7. [Environment Variables](#environment-variables)
8. [Running the Application](#running)
9. [API Reference](#api-reference)
10. [Deployment (Vercel + Render)](#deployment)

---

## Overview
A fully responsive personal finance management platform featuring:
- JWT Authentication & role-based access
- Transaction CRUD with category tagging
- Dashboard with real-time charts & analytics
- Budget goal tracking
- Responsive design (mobile, tablet, desktop)

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS 3, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| HTTP Client | Axios |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure
```
finance-tracker/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios instances & API calls
│   │   │   └── axiosInstance.js
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Badge.jsx
│   │   │   └── charts/
│   │   │       ├── ExpenseChart.jsx
│   │   │       └── IncomeChart.jsx
│   │   ├── context/            # React Context (Auth, Finance)
│   │   │   ├── AuthContext.jsx
│   │   │   └── FinanceContext.jsx
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   └── useTransactions.js
│   │   ├── pages/              # Route-level pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/              # Helper functions
│   │   │   ├── formatCurrency.js
│   │   │   └── dateHelpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── transactionRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Atlas account → https://cloud.mongodb.com
- Git → https://git-scm.com

---

## Backend Setup

### 1. Initialize & Install
```bash
cd server
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet morgan express-validator
npm install -D nodemon
```

### 2. package.json scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## Frontend Setup

### 1. Create Vite + React App
```bash
npm create vite@latest client -- --template react
cd client
npm install
```

### 2. Install Dependencies
```bash
npm install axios react-router-dom react-hot-toast chart.js react-chartjs-2 lucide-react date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Environment Variables

### server/.env
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/financedb
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### client/.env
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Application

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## API Reference

### Auth Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/auth/register | Register user | No |
| POST | /api/auth/login | Login & get token | No |
| GET | /api/auth/me | Get current user | Yes |

### Transaction Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/transactions | Get all transactions | Yes |
| POST | /api/transactions | Create transaction | Yes |
| PUT | /api/transactions/:id | Update transaction | Yes |
| DELETE | /api/transactions/:id | Delete transaction | Yes |
| GET | /api/transactions/summary | Get analytics summary | Yes |

---

## Deployment

### Backend → Render.com
1. Push server/ to GitHub
2. Create new Web Service on Render
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables from server/.env

### Frontend → Vercel
1. Push client/ to GitHub
2. Import project on vercel.com
3. Framework: Vite
4. Add env: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Deploy!
"# finance_tracker" 
