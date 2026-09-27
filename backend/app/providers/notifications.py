from dataclasses import dataclass
from typing import Protocol


class ProviderNotConfigured(RuntimeError):
    """Raised when no external delivery provider has been configured."""


@dataclass(frozen=True)
class DeliveryMessage:
    recipient: str
    subject: str
    body: str


class NotificationProvider(Protocol):
    def send_email(self, message: DeliveryMessage) -> str:
        """Send a message and return the provider's idempotency/message id."""


class NoopProvider:
    """Safe default: queue work is observable, but nothing is sent externally."""

    def send_email(self, message: DeliveryMessage) -> str:
        raise ProviderNotConfigured("No notification provider configured")
