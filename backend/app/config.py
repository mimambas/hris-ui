from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "HRIS"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    AUTO_CREATE_SCHEMA: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://hris:hris_dev@localhost:5432/hris"
    DATABASE_URL_SYNC: str = "postgresql://hris:hris_dev@localhost:5432/hris"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Superadmin seed
    SEED_ADMIN_EMAIL: str = "admin@hris.local"
    SEED_ADMIN_PASSWORD: str = "Admin123!"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.DATABASE_URL

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL_SYNC.startswith("postgres://"):
            return self.DATABASE_URL_SYNC.replace("postgres://", "postgresql://", 1)
        return self.DATABASE_URL_SYNC


@lru_cache
def get_settings() -> Settings:
    return Settings()
