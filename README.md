# CDI IELTS Platform
A full-stack IELTS practice platform with Django REST backend and modern Next.js frontend.

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8700/api/docs
- API Schema: http://localhost:8700/api/schema

Table of contents
- Overview
- Features
- Tech stack
- Quick start (local)
- Environment variables
- Running (local and Docker)
- Frontend
- Payments (Click) — Top-up flow
- Project structure
- Useful commands
- Contributing

Overview
CDI IELTS is a full-stack platform for IELTS practice. It includes a Django REST backend with authentication, user profiles, tests, speaking module, teacher checking, and payment top-ups via Click, plus a modern Next.js frontend with IELTS-themed design (red and white colors).

Features
- JWT auth and user accounts with OTP verification
- Modern Next.js frontend with IELTS branding (red/white theme)
- Profiles with balances and top-up history
- IELTS tests and user test tracking
- Test-taking interface (listening, reading, writing)
- Speaking module and teacher checking flows
- Payments: Click integration (top-up redirect + webhook)
- Teacher dashboard for checking student submissions
- OpenAPI/Swagger docs with drf-spectacular

Tech stack
Backend:
- Python 3 + Django REST Framework
- PostgreSQL
- JWT (simplejwt)
- Docker

Frontend:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Axios

Quick start (local)
1) Clone and enter the project
- git clone <your_repo_url>
- cd CDI_IELTS

2) Backend setup
- python -m venv .venv
- source .venv/bin/activate  # Windows: .venv\Scripts\activate
- pip install -r requirements.txt
- Configure .env (see Environment variables)
- python manage.py migrate
- python manage.py runserver 8700

3) Frontend setup (in new terminal)
- cd frontend
- npm install
- npm run dev

Open http://localhost:3000 for the frontend and http://localhost:8700/api/docs for the API.

Environment variables
Backend (.env in project root):

# Django
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
TIME_ZONE=Asia/Tashkent

# PostgreSQL (docker-compose uses service name "db")
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Click (payment) configuration
CLICK_SERVICE_ID=11111
CLICK_MERCHANT_ID=22222
CLICK_MERCHANT_USER_ID=33333
CLICK_SECRET_KEY=your_click_secret
CLICK_BASE_URL=https://my.click.uz/services/pay
CLICK_RETURN_URL=http://localhost:3000/payment/return
CLICK_CANCEL_URL=http://localhost:3000/payment/cancel

# CORS/CSRF
CORS_ALLOW_ALL_ORIGINS=True
CSRF_TRUSTED_ORIGINS=http://localhost:8700

Frontend (frontend/.env.local):

NEXT_PUBLIC_API_URL=http://localhost:8700/api

Frontend
The Next.js frontend provides:
- Home page with platform overview
- Login/Register with OTP verification
- Student dashboard with balance and profile
- Browse and purchase tests
- Test-taking interface (listening, reading, writing)
- View test results and scores
- Top-up balance via Click payment
- Request speaking sessions
- Teacher dashboard for checking submissions

Design theme: IELTS red (#dc2626) and white color scheme.

See frontend/README.md for more details.

Payments (Click) — Top-up flow
This project implements a simple top-up flow using Click.

1) Create top-up session (frontend)
- Method: POST /api/payments/topup/
- Auth: Bearer token (user)
- Body: { "amount": 50000 }
- Response: 201 Created with JSON:
  {
    "id": "<uuid>",
    "status": "created",
    "amount": "50000.00",
    "currency": "UZS",
    "created_at": "2025-01-01T12:00:00Z",
    "completed_at": null,
    "redirect_url": "https://my.click.uz/services/pay?..."
  }
- Frontend redirects the user to redirect_url.

2) User completes/cancels payment on Click page
- Click redirects back to your frontend using the provided return/cancel URLs.

3) Click server invokes webhook (backend)
- Endpoint: POST /api/payments/click/webhook/
- The backend verifies IP and signature and updates the payment status.

4) Frontend polls payment status
- Method: GET /api/payments/status/?payment_id=<uuid>

Notes
- Minimal and maximal top-up amounts are controlled by settings:
  - PAYMENTS.MIN_TOPUP (default 1000)
  - PAYMENTS.MAX_TOPUP (default 5_000_000)
- Webhook security:
  - Signature is verified.
  - Allowed IPs are restricted in settings.CLICK.ALLOWED_IPS.

Running with Docker
Full stack with docker-compose:
- docker-compose up --build

Then:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8700/api/docs

Project structure
- apps/ — Django apps: accounts, users, tests, user_tests, payments, profiles, speaking, teacher_checking
- config/ — Django settings and URLs
- bot/ — Telegram bot integration
- frontend/ — Next.js frontend application
- static/, media/ — static/user media

Useful commands
Backend:
- Run server: python manage.py runserver 8700
- Apply migrations: python manage.py migrate
- Create superuser: python manage.py createsuperuser

Frontend:
- Run dev server: cd frontend && npm run dev
- Build: cd frontend && npm run build

Docker:
- Start all services: docker-compose up
- Start specific service: docker-compose up frontend
- Rebuild: docker-compose up --build

Contributing
1) Fork the repo
2) Create a feature branch: git checkout -b feature/awesome
3) Commit: git commit -m "feat: add awesome thing"
4) Push: git push origin feature/awesome
5) Open a Pull Request
