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

---

### ✅ Feature 2 — Campaign Creation & Budget Allocation
- Advertisers and admins can create campaigns
- Fields: title, description, budget, startDate, endDate, targetAudience, objective
- Assign agencies and publishers to a campaign
- Campaign statuses: `draft`, `active`, `completed`, `cancelled`
- Budget cannot be reduced below amount already spent
- Only `draft` campaigns can be deleted
- `spent` field tracks total media purchases against budget
- `blockchainTxHash` field reserved for on-chain recording (Feature 6)

#### API Endpoints
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/campaigns` | Advertiser, Admin |
| GET | `/api/campaigns` | Advertiser (own), Admin (all) |
| GET | `/api/campaigns/:id` | Owner, Admin |
| PUT | `/api/campaigns/:id` | Owner, Admin |
| DELETE | `/api/campaigns/:id` | Owner, Admin (draft only) |

---

### ✅ Feature 3 — Agency & Publisher Management
- Agency users create a profile with company name, commission rate, and contact info
- Publisher users create a profile with website, audience category, and ad placements
- Publishers manage placement inventory (banner, video, native, popup, sponsored)
- Each placement has type, platform, price per unit (CPM/CPC/CPD/flat), and available inventory
- Admin can verify agencies and publishers
- Advertisers and agencies can browse all publishers and their placements

#### API Endpoints
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/agencies` | Agency |
| GET | `/api/agencies` | Admin, Agency, Advertiser |
| GET | `/api/agencies/:id` | Admin, Agency, Advertiser |
| PUT | `/api/agencies/:id` | Owner, Admin |
| PATCH | `/api/agencies/:id/verify` | Admin |
| POST | `/api/publishers` | Publisher |
| GET | `/api/publishers` | All roles |
| GET | `/api/publishers/:id` | All roles |
| PUT | `/api/publishers/:id` | Owner, Admin |
| POST | `/api/publishers/:id/placements` | Owner, Admin |
| DELETE | `/api/publishers/:id/placements/:placementId` | Owner, Admin |
| PATCH | `/api/publishers/:id/verify` | Admin |
