# Advertising Transaction Transparency System (ATTS)

A blockchain-based advertising transparency platform built with React, Node.js, MongoDB, and Solidity.

## Tech Stack
- **Frontend**: React + Vite, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Blockchain**: Solidity, Hardhat *(coming in later features)*

## Getting Started

### Backend
```bash
cd backend
npm install
# Configure .env (MONGO_URI, JWT_SECRET, PORT)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Features

### ✅ Feature 1 — User Registration, Login & Role-Based Access
- Register as **advertiser**, **agency**, **publisher**, or **admin**
- JWT-based authentication (7-day token)
- `protect` middleware guards all private routes
- `authorize(...roles)` middleware restricts by role
- Admin can view all users and activate/deactivate accounts
- Frontend: Register, Login, Dashboard, and Admin Users pages
- Protected routes redirect unauthenticated users to `/login`
- Role-restricted routes redirect unauthorized users to `/dashboard`

#### API Endpoints
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/users` | Admin only |
| PATCH | `/api/users/:id/status` | Admin only |
