from app.celery_app import celery_app
from app.providers.notifications import DeliveryMessage, NoopProvider, ProviderNotConfigured


@celery_app.task(name="notifications.process_email_outbox", autoretry_for=(), bind=True)
def process_email_outbox(self) -> dict[str, int]:
    """Safe provider boundary; external dispatch stays disabled until configured."""
    provider = NoopProvider()
    try:
        provider.send_email(DeliveryMessage(recipient="", subject="", body=""))
    except ProviderNotConfigured:
        return {"claimed": 0, "sent": 0, "deferred": 0}
    return {"claimed": 0, "sent": 0, "deferred": 0}
