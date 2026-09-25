import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_readiness_contract(client):
    response = client.get('/ready')
    assert response.status_code in {200, 503}
    assert response.json()['status'] in {'ready'} if response.status_code == 200 else True
