# HRIS — Human Resource Information System

HRIS adalah platform untuk mengelola data karyawan, absensi, cuti, payroll, rekrutmen, dan seluruh employee lifecycle.

## Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (async)
- **Database:** PostgreSQL 15
- **Cache/Queue:** Redis 7, Celery
- **Design:** Coinbase-inspired system — see [DESIGN.md](DESIGN.md)
- **Deployment:** AWS (ECS Fargate, RDS, S3, CloudFront)

## Quick Start (Docker)

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/api/v1/docs
- Health check: http://localhost:8000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Default Login

- Email: `admin@hris.local`
- Password: `Admin123!`

> Ganti credentials dan `JWT_SECRET_KEY` sebelum deployment.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Database Migration

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
python seed.py
```

## Tests

```bash
cd backend
pytest
ruff check app tests
```

## Project Docs

- [PRD](PRD.md)
- [Design System](DESIGN.md)
- [Implementation Plan](../.claude/plans/glimmering-wandering-dusk.md)
