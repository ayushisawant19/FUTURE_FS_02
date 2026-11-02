# 🚀 Mini CRM - Client Lead Management System

> **A modern, job-ready full-stack CRM built to manage, track, and convert client leads generated from website contact forms.**

---

## 📌 Project Overview
Many agencies and small businesses lose potential clients due to fragmented spreadsheets and slow follow-ups. **Mini CRM** acts as the backend control system behind a business website, providing:
1. **Immediate Lead Ingestion:** Captures inbound leads from website contact forms in real-time.
2. **Actionable Follow-up Tracking:** Enables sales reps and business owners to log chronological call/meeting notes and schedule future follow-up dates.
3. **Conversion Pipeline & Analytics:** Visualizes pipeline health (New, Contacted, Converted, Lost) and tracks key business KPIs like overall conversion rate and acquisition channels.

---

## 🎯 Key Features Implemented

### 🌟 Core Requirements
- [x] **Lead Listing:** Comprehensive directory displaying lead name, email, phone, company, source channel, status, and creation date.
- [x] **Lead Status Updates:** Real-time status modification (`new` ➔ `contacted` ➔ `converted` ➔ `lost`) directly from the table or modal.
- [x] **Notes & Follow-up History:** Chronological activity timeline for each lead with author tags, timestamps, and next follow-up scheduling.
- [x] **Secure Admin Access:** JWT-based authentication protecting all lead management endpoints with session handling.

### 🎁 Bonus Features
- [x] **Interactive Analytics Dashboard:** Real-time KPI summary cards (Total Leads, Needs Attention, In Pipeline, Converted Deals, and % Conversion Rate).
- [x] **Data Visualizations:** Interactive Chart.js donut chart (Status Distribution) and bar chart (Acquisition Channels).
- [x] **Search & Multi-Filter:** Instant debounced search by name/email/company/inquiry, plus status and acquisition source filtering.
- [x] **Public Website Contact Form:** Included demo landing page (`/contact`) simulating how client website visitors submit inquiries that instantly become CRM leads.
- [x] **CSV Data Export:** One-click data export (`/api/leads/export/csv`) for spreadsheet reporting and external backups.
- [x] **Complete CRUD Support:** Create, read, edit details, and delete leads with instant UI updates.
- [x] **Pre-seeded Sample Data:** Includes realistic B2B client inquiries and notes out-of-the-box.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js (REST API architecture, modular routes, and controllers)
- **Frontend:** HTML5, Modern CSS (Tailwind CSS via CDN), JavaScript (ES6+), Chart.js, FontAwesome
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), bcrypt password handling
- **Database / Storage:** Persistent file-based JSON store with atomic writes & MongoDB ready architecture (zero external dependencies required for immediate execution)
- **Tooling:** Git, VS Code, npm

---

## 📁 Repository Structure

```text
├── config/
│   └── db.js                 # Data persistence layer and database helpers
├── controllers/
│   ├── authController.js     # Admin login and session verification
│   ├── leadController.js     # Lead CRUD, notes timeline, analytics & CSV export
│   └── publicController.js   # Public website inquiry handling
├── data/
│   └── leads.json            # Pre-seeded client leads & follow-up notes
├── middleware/
│   └── authMiddleware.js     # JWT route protection middleware
├── public/
│   ├── css/
│   │   └── style.css         # Custom styling, badges, animations
│   ├── js/
│   │   ├── dashboard.js      # Dashboard reactivity, charts, filters & modals
│   │   ├── login.js          # Admin authentication script
│   │   └── contact.js        # Public form submission script
│   ├── index.html            # Main CRM Admin Dashboard
│   ├── login.html            # Secure Admin Login Portal
│   └── contact.html          # Public Website Contact Form Demo
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── leadRoutes.js         # /api/leads routes
│   └── publicRoutes.js       # /api/public routes
├── .env.example              # Template environment variables
├── .gitignore                # Git ignore configuration
├── package.json              # Project dependencies and startup scripts
├── README.md                 # Project documentation and guide
└── server.js                 # Express server entry point
```

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or newer)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/mini-crm-lead-manager.git
cd mini-crm-lead-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Default `.env` settings:
```env
PORT=5000
JWT_SECRET=mini_crm_super_secret_jwt_key_2026_xyz
ADMIN_EMAIL=admin@crm.com
ADMIN_PASSWORD=admin123
```

### 4. Start the Application
```bash
npm start
```
The server will start at:
- **Admin Dashboard:** [http://localhost:5000](http://localhost:5000)
- **Admin Login:** [http://localhost:5000/login](http://localhost:5000/login)
- **Public Website Contact Form:** [http://localhost:5000/contact](http://localhost:5000/contact)

---

## 🔑 Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `admin123` |

---

## 🌐 API Reference

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/public/contact` | Submits inquiry from website contact form and generates lead |

### Authentication Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates admin and returns JWT token |
| `GET` | `/api/auth/me` | Validates session token |

### Protected CRM Endpoints *(Requires `Authorization: Bearer <token>`)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | List all leads (supports `?search=`, `?status=`, `?source=`) |
| `POST` | `/api/leads` | Create a new lead manually |
| `GET` | `/api/leads/:id` | Retrieve single lead details |
| `PUT` | `/api/leads/:id` | Update lead fields or status (`new`, `contacted`, `converted`, `lost`) |
| `DELETE` | `/api/leads/:id` | Permanently remove a lead |
| `POST` | `/api/leads/:id/notes` | Add timestamped follow-up note & next follow-up date |
| `GET` | `/api/leads/analytics/overview` | Fetch business metrics & pipeline breakdown |
| `GET` | `/api/leads/export/csv` | Download complete lead list as CSV file |

---

## 💼 Real-World Business Value
This project answers the three essential questions of every business owner:
1. **"How quickly can I see new leads?"** — Inbound inquiries from the contact form appear instantly in the CRM, flagged with a vibrant `Needs Attention` alert.
2. **"Can I track follow-ups easily?"** — Every interaction is logged with a timestamp and author, preventing missed opportunities and keeping client discussions organized.
3. **"Can I see which leads converted?"** — Real-time analytics cards and status distribution donut charts show exactly how many leads convert into paying customers.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
