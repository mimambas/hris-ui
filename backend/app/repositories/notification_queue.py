from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.config import get_settings


@dataclass(frozen=True)
class QueuePolicy:
    max_attempts: int = 3
    backoff_base_seconds: int = 60

    def retry_at(self, attempts: int, now: datetime | None = None) -> datetime:
        current = now or datetime.now(timezone.utc)
        delay = self.backoff_base_seconds * (2 ** max(0, attempts - 1))
        return current + timedelta(seconds=delay)

    def terminal(self, attempts: int) -> bool:
        return attempts >= self.max_attempts


def queue_policy() -> QueuePolicy:
    settings = get_settings()
    return QueuePolicy(
        max_attempts=settings.NOTIFICATION_MAX_ATTEMPTS,
        backoff_base_seconds=settings.NOTIFICATION_BACKOFF_BASE_SECONDS,
    )
