# Venturly — Work Funding Platform (MERN)

A modern crowdfunding/work-funding platform where **creators, innovators & changemakers**
showcase their work (videos, images, links, styled paragraphs with background images) and
**verified investors** discover, connect with and invest in ideas for a chosen amount & period.

Built with **MongoDB · Express · React · Node** + Tailwind, with **Razorpay** payments
(running in dummy/test mode out of the box).

---

## ✨ Key features

| Flow | What happens |
|------|--------------|
| **Roles** | `creator`, `investor`, `admin` chosen at sign-up |
| **Creator pages** | Rich block editor — paragraphs (with background images), images, videos, links, cover & page background, funding goal/min/period |
| **Investor verification** | Investor uploads a document → status `pending` → **admin toggles verified** → marketplace unlocks |
| **10% preview gating** | Unverified-of-subscription investors see only ~10% of each idea; the rest is locked |
| **Subscription unlock** | Monthly/Yearly plan via Razorpay unlocks 100% of every idea |
| **Invest flow** | Choose amount + period + message → Razorpay checkout → funds tracked on the idea |
| **Connect** | Investors send connection requests to creators |
| **Admin console** | Verify/revoke investors, view platform stats |

---

## 🗂 Structure

```
chai/
├── backend/          # Express API + MongoDB (Mongoose)
│   ├── src/
│   │   ├── models/        User, Idea, Investment, Subscription, Connection
│   │   ├── controllers/   auth, idea, upload, investment, subscription, connection, admin
│   │   ├── routes/        all REST routes
│   │   ├── middleware/    auth (JWT + role + verified guards), upload (multer)
│   │   ├── utils/         token, payment (Razorpay+dummy), seed
│   │   └── config/        db (Atlas or zero-setup local Mongo)
│   └── uploads/      # uploaded media & verification docs
└── frontend/         # React (Vite) + Tailwind
    └── src/
        ├── pages/    Landing, Login, Register, Verify, Dashboard, EditIdea,
        │             Explore, IdeaDetail, Pricing, Portfolio, Admin
        ├── components/  Navbar, Icons
        ├── context/  AuthContext
        └── lib/      api, checkout, upload, format
```

---

## 🚀 Running locally

You need **Node 18+**. No database install required — the backend boots a persistent
local MongoDB automatically (data saved in `backend/.mongo-data`).

### 1. Backend
```bash
cd backend
npm install
npm run seed     # seeds demo users + ideas
npm run dev      # or: npm start  → http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev      # → http://localhost:5173
```

Open **http://localhost:5173**.

### Demo logins (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@venturly.com` | `admin123` |
| Creator | `aarav@creator.com` | `pass123` |
| Verified investor | `vikram@investor.com` | `pass123` |
| Unverified investor | `pooja@investor.com` | `pass123` |

---

## 🔑 Verifying an investor

**In-app (recommended):** log in as `admin@venturly.com`, open **Admin** → click **Verify**.

**Directly in the DB (the "toggle the key" approach):** set `isVerified: true` on the
investor's `users` document. With a `MONGO_URI` pointing at Atlas/Compass you can flip it
from any Mongo client.

---

## 💳 Payments (Razorpay)

Out of the box `PAYMENT_MODE=dummy` (and placeholder keys) in `backend/.env`, so checkout
completes instantly without real credentials — perfect for development.

To use the **real Razorpay test widget**, put your test keys in `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
PAYMENT_MODE=live
```
The frontend's Razorpay script is already loaded in `index.html`.

---

## 🌐 Using MongoDB Atlas instead of local

Set `MONGO_URI` in `backend/.env`:
```
MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/venturly
```
Then `npm run seed` and `npm run dev`.

---

## 🔌 API overview

```
POST   /api/auth/register | login        GET /api/auth/me   PUT /api/auth/profile
POST   /api/uploads                        POST /api/uploads/verification
GET    /api/ideas (verified only)          GET /api/ideas/:id   GET /api/ideas/mine
POST   /api/ideas   PUT/DELETE /api/ideas/:id
POST   /api/investments/order | verify     GET /api/investments/mine | received
GET    /api/subscriptions/plans            POST /api/subscriptions/order | verify
POST   /api/connections                    GET /api/connections/mine | received
GET    /api/admin/investors | stats        PUT /api/admin/investors/:id/verify
```
