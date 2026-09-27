import pytest

from app.providers.notifications import DeliveryMessage, NoopProvider, ProviderNotConfigured


def test_noop_provider_never_claims_delivery():
    with pytest.raises(ProviderNotConfigured, match="No notification provider configured"):
        NoopProvider().send_email(DeliveryMessage("person@example.com", "Subject", "Body"))
