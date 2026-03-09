# Full-stack AI-powered expense bill approval system with Django backend and React frontend.

---

## ✅ PROJECT SETUP COMPLETE

### Backend (Django)
- **Status**: Running on `http://localhost:8000`
- **Database**: SQLite (development)
- **Port**: 8000

#### Configured Apps:
1. **Bills** (`/api/bills/`)
   - Upload bills with OCR & category prediction
   - List, retrieve, approve, reject bills
   - Automatic workflow based on amount tiers

2. **Approvals** 
   - Multi-level approval workflow (Accounts → Manager → MD)
   - Status tracking (Pending, Approved, Rejected, Under Review)
   - Amount-based routing

3. **Audit** (`/api/audit/<bill_id>/`)
   - Complete audit trail tracking
   - Action logging and timestamps
   - User action attribution

4. **Analytics** (`/api/analytics/`)
   - Total expenses aggregation
   - Category-wise spending
   - Approval statistics

5. **Notifications**
   - Email notifications (console backend for dev)
   - Task queue support

#### API Endpoints:
```
POST   /api/bills/upload/        - Upload new bill
GET    /api/bills/               - List all bills
GET    /api/bills/<id>/          - Get bill details
POST   /api/bills/<id>/approve/  - Approve bill
POST   /api/bills/<id>/reject/   - Reject bill
GET    /api/audit/<bill_id>/     - Get audit trail
GET    /api/analytics/           - Get analytics
```

#### Admin Panel:
- URL: `http://localhost:8000/admin/`
- Username: `admin`
- Password: `admin123`

### Frontend (React + Vite)
- **Status**: Running on `http://localhost:5173`
- **Port**: 5173
- **Build Tool**: Vite
- **Framework**: React 18.3.1

#### Pages:
1. **Analytics** - Dashboard with expense summaries and charts
2. **Bill List** - View all bills with filtering and search
3. **Bill Upload** - Upload and process bills with OCR
4. **Bill Details** - View bill details and approve/reject

#### Features:
- ✅ Chart.js integration for analytics
- ✅ Framer Motion animations
- ✅ React Router navigation
- ✅ Axios API client with CORS configured
- ✅ Responsive sidebar layout
- ✅ Color-coded status badges

#### Start Frontend:
```bash
npm run dev
```
Runs in directory: `frontend/react-vite/`

---

## 🔧 Key Features

### OCR & Document Processing
- Pytesseract integration for bill text extraction
- Automatic vendor name and amount detection
- Category prediction using ML

### Approval Workflow
- **< 5000**: Single approval (Accounts)
- **5000 - 20000**: Dual approval (Accounts + Manager)
- **> 20000**: Triple approval (Accounts + Manager + MD)

### Duplicate Detection
- Smart bill matching (vendor + amount + date)
- Duplicate warnings on upload

### Audit & Compliance
- Complete action logging
- Timestamp tracking
- User attribution
- Status change history

---

## 📊 Database Schema

### Bill
- bill_id (primary key)
- vendor_name
- amount
- category (Travel, Fuel, Repair, Courier, Other)
- bill_date
- bill_due_date
- file_path
- status (Pending, Under Review, Approved, Rejected)
- created_at

### Approval
- approval_id (primary key)
- bill_id (foreign key)
- approver_role (Accounts, Manager, MD)
- status (Pending, Approved, Rejected, Under Review)
- comments
- approved_at

### AuditTrail
- audit_id (primary key)
- bill_id (foreign key)
- action
- performed_by
- timestamp

---

## 🚀 Running the Project

### Start Both Servers:
```powershell
# Terminal 1: Backend
cd backend
python manage.py runserver 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Access Points:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

---

## 📦 Dependencies

### Backend
- Django 5.0.3
- Django REST Framework 3.15.1
- psycopg2-binary 2.9.11 (PostgreSQL adapter)
- Pillow 12.1.1 (image processing)
- pytesseract 0.3.10 (OCR)
- django-cors-headers 4.3.1 (CORS)

### Frontend
- React 18.3.1
- React DOM 18.3.1
- React Router DOM 7.13.1
- Vite 5.4.10
- Axios 1.13.6
- Chart.js 4.5.1
- Framer Motion 12.35.0
- ESLint 9.13.0

---

## ✅ Verified Functionality

- [x] Backend dependencies installed
- [x] Database migrations created and applied
- [x] All models created (Bill, Approval, AuditTrail)
- [x] API endpoints configured
- [x] Frontend scripts configured
- [x] CORS enabled for frontend-backend communication
- [x] SQLite database initialized
- [x] Admin superuser created
- [x] Frontend build and dev tools ready
- [x] File upload handling configured
- [x] Approval workflow logic implemented

---

## 🔐 Development Settings

**Security Note**: Current settings are for **DEVELOPMENT ONLY**
- DEBUG = True
- ALLOWED_HOSTS = ['*']
- CORS_ALLOW_ALL_ORIGINS = True
- SECRET_KEY = temporary

**For Production**:
- Set DEBUG = False
- Configure specific ALLOWED_HOSTS
- Change SECRET_KEY
- Use PostgreSQL database
- Configure environment variables
- Enable proper CORS restrictions

---

## 📝 Notes

- SQLite is used for development (no PostgreSQL setup required)
- For PostgreSQL: Update DATABASES in settings.py with connection details
- OCR functionality requires Tesseract installation on system
- Email notifications currently use console backend (visible in Django logs)
- All API responses include proper error handling and status codes

---


# 🚀 Quick Start Guide

Your Bill System project is fully configured and ready to run.

---

## 🏃 How to Run

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver 8000
```
✅ Backend will be available at: `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend will be available at: `http://localhost:5173`

### Option 2: Individual Commands

**Backend only:**
```bash
cd "c:\Users\DEEPAK\Desktop\WEB DEVELOPMENT - LEARNING\JS learning\bill-system\backend"
python manage.py runserver 8000
```

**Frontend only:**
```bash
cd "c:\Users\DEEPAK\Desktop\WEB DEVELOPMENT - LEARNING\JS learning\bill-system\frontend"
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React UI - Upload, view, approve bills |
| Backend API | http://localhost:8000/api/ | REST API endpoints |
| Django Admin | http://localhost:8000/admin/ | Database management |

---

## 📋 What's Included

✅ **Backend (Django)**
- Full REST API with bill management
- Approval workflow engine
- OCR & category prediction ready
- Audit trail logging
- CORS enabled for frontend

✅ **Frontend (React + Vite)**
- Responsive dashboard
- Bill upload interface
- Analytics with charts
- Real-time status tracking
- Modern animations

✅ **Database**
- SQLite development database
- All tables created
- Ready for data

✅ **Dependencies**
- All Python packages installed
- All NPM packages installed
- No missing dependencies

---

## 📊 Main Features

1. **Upload Bills**
   - File upload with validation
   - Automatic OCR processing (Pytesseract)
   - Smart duplicate detection
   - Auto-categorization

2. **Approve/Reject**
   - Multi-level approval workflow
   - Amount-based routing
   - Comment capabilities
   - Status tracking

3. **View Analytics**
   - Total expenses dashboard
   - Category breakdown
   - Approval statistics
   - Charts and graphs

4. **Track Audit**
   - Complete action history
   - User attribution
   - Timestamp logging
   - Decisions tracked

---

## API Endpoints Reference

### Bills
```
POST   /api/bills/upload/          Create new bill
GET    /api/bills/                 List all bills
GET    /api/bills/{id}/            Get bill details
POST   /api/bills/{id}/approve/    Approve bill
POST   /api/bills/{id}/reject/     Reject bill
```

### Audit
```
GET    /api/audit/{bill_id}/       Get audit trail
```

### Analytics
```
GET    /api/analytics/             Get dashboard stats
```

---

## 🛠️ Useful Commands

**Backend:**
```bash
# Create superuser
python manage.py createsuperuser

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run tests
python manage.py test
```

**Frontend:**
```bash
# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
bill-system/
├── backend/                 (Django)
│   ├── django_project/     (Settings & URLs)
│   ├── bills/              (Bill management)
│   ├── approvals/          (Approval workflow)
│   ├── audit/              (Audit logging)
│   ├── analytics/          (Analytics API)
│   ├── notifications/      (Notifications)
│   ├── utils/              (OCR & ML)
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/               (React + Vite)
    └── react-vite/
        ├── src/
        │   ├── pages/      (Bill List, Upload, etc.)
        │   ├── components/ (Sidebar, etc.)
        │   ├── services/   (API client)
        │   └── styles/     (CSS)
        ├── package.json
        └── vite.config.js
```

---

## ⚠️ Important Notes

1. **SQLite Database**: Used for development
   - File: `backend/db.sqlite3`
   - Automatically created

2. **CORS Enabled**: Frontend can access backend
   - Configured in settings.py
   - All origins allowed (dev only)

3. **Static Files**: Served by Django dev server
   - Media files in: `backend/media/`

4. **Email**: Console backend for dev
   - Check Django server output for emails

---

## ❓ Troubleshooting

**Port already in use?**
```bash
# Use different port
python manage.py runserver 8001
```

**Missing migrations?**
```bash
python manage.py migrate
```

**CORS errors?**
- Backend is configured to accept all origins
- Ensure both servers running

**Frontend not loading?**
- Clear browser cache
- Check http://localhost:5173

---

## 🎯 Next Steps

1. ✅ Start both servers
2. ✅ Open http://localhost:5173
3. ✅ Upload a bill
4. ✅ View analytics
5. ✅ Approve/Reject bills
6. ✅ Check audit trail

---


# AI Expense Bill Approval System - Extension Notes

## Auth APIs
- `POST /api/auth/login/` -> returns `token`, `role`, `department`, `username`
- `GET /api/auth/me/` -> current user profile

## Roles
- `RECEPTIONIST`: upload + view uploaded bills
- `ACCOUNTANT`: verify OCR and edit bill details
- `MANAGER`: approve or reject accountant-verified bills
- `CEO`: analytics, AI assistant, audit logs, final approval/rejection

## Bill Status Flow
- `UPLOADED`
- `ACCOUNTANT_VERIFIED`
- `MANAGER_APPROVED`
- `MANAGER_REJECTED`
- `CEO_APPROVED`
- `CEO_REJECTED`
- `PAID`

## Existing Bill APIs (preserved)
- `POST /api/bills/upload/`
- `GET /api/bills/`
- `GET /api/bills/<id>/`
- `POST /api/bills/<id>/approve/`
- `POST /api/bills/<id>/reject/`

## New Bill API
- `POST /api/bills/<id>/mark-paid/`

## OCR + ML
- OCR stack: `pytesseract`, `opencv`, `Pillow`
- Extracted fields stored in `bill.ocr_extracted_data` (JSON)
- Category prediction includes: `Travel`, `Fuel`, `Repair`, `Courier`, `Office Supplies`, `Other`

## CEO APIs
- `GET /api/analytics/`
- `POST /api/analytics/assistant/`
- `GET /api/audit/`

## Setup
- SQLite default.
- PostgreSQL enabled automatically when `POSTGRES_DB` env var is present.

## Seed Role Users
- Command: `python manage.py seed_role_users`
- Default users: `reception1`, `account1`, `manager1`, `ceo1`
- Default password: `Pass@12345`
