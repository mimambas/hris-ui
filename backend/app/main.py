from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from app.api.v1 import auth, employees
from app.config import get_settings
from app.database import AsyncSessionLocal, Base, engine
from app.models.user import User
from app.utils.security import hash_password

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.AUTO_CREATE_SCHEMA:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(User).where(User.email == settings.SEED_ADMIN_EMAIL))
            if result.scalar_one_or_none() is None:
                db.add(User(
                    email=settings.SEED_ADMIN_EMAIL,
                    password_hash=hash_password(settings.SEED_ADMIN_PASSWORD),
                    role="super_admin",
                    is_active=True,
                ))
                await db.commit()
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(employees.router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}


@app.get("/ready")
async def readiness_check():
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ready", "version": settings.APP_VERSION}
