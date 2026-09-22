import asyncio
from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models.user import User
from app.utils.security import hash_password
from sqlalchemy import select

settings = get_settings()


async def seed_admin():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == settings.SEED_ADMIN_EMAIL))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Admin user '{settings.SEED_ADMIN_EMAIL}' already exists.")
            return

        admin = User(
            email=settings.SEED_ADMIN_EMAIL,
            password_hash=hash_password(settings.SEED_ADMIN_PASSWORD),
            role="super_admin",
            is_active=True,
        )
        db.add(admin)
        await db.commit()
        print(f"Admin user created: {settings.SEED_ADMIN_EMAIL}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
