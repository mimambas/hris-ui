import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog


async def log_audit(
    db: AsyncSession,
    user_id: str | None,
    entity_type: str,
    entity_id: str | None,
    action: str,
    old_value: dict | None = None,
    new_value: dict | None = None,
    ip_address: str | None = None,
):
    entry = AuditLog(
        user_id=user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        old_value=json.dumps(old_value) if old_value else None,
        new_value=json.dumps(new_value) if new_value else None,
        ip_address=ip_address,
    )
    db.add(entry)
    await db.flush()
