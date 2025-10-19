from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'


def test_predict_basic():
    payload = {
        "title": "Remote Data Entry Clerk",
        "company": "Acme",
        "description": "Work from home and earn $1000 per day. Contact via WhatsApp.",
    }
    r = client.post('/api/predict', json=payload)
    assert r.status_code == 200
    body = r.json()
    assert set(body.keys()) == {"label", "confidence", "scores"}
    assert set(body["scores"].keys()) == {"fake", "real"}
