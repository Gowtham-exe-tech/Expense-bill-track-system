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
