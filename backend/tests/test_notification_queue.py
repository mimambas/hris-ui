import asyncio
from datetime import datetime, timedelta, timezone

from app.repositories.notification_queue import QueuePolicy


def test_retry_backoff_is_exponential():
    policy = QueuePolicy(max_attempts=3, backoff_base_seconds=60)
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    assert policy.retry_at(1, now) == now + timedelta(seconds=60)
    assert policy.retry_at(2, now) == now + timedelta(seconds=120)
    assert policy.retry_at(3, now) == now + timedelta(seconds=240)


def test_terminal_attempt_policy():
    policy = QueuePolicy(max_attempts=3)
    assert not policy.terminal(1)
    assert not policy.terminal(2)
    assert policy.terminal(3)
    assert policy.terminal(4)


def test_queue_policy_is_safe_for_concurrent_callers():
    policy = QueuePolicy(max_attempts=3, backoff_base_seconds=1)
    now = datetime.now(timezone.utc)
    results = asyncio.run(_calculate(policy, now))
    assert len(results) == 20
    assert all(result > now for result in results)


async def _calculate(policy: QueuePolicy, now: datetime):
    return await asyncio.gather(*(asyncio.to_thread(policy.retry_at, 1, now) for _ in range(20)))
