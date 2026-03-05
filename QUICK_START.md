# 🚀 Quick Start Guide

## ✅ Everything is Ready!

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

## 🔐 Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

Login at: http://localhost:8000/admin/

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

**Everything is ready! Happy coding! 🚀**
