import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import Suggestion


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_and_get_notes(client):
    res = client.get("/notes")
    assert res.status_code == 200
    notes = res.json()
    assert len(notes) >= 3

    first_id = notes[0]["id"]
    res_single = client.get(f"/notes/{first_id}")
    assert res_single.status_code == 200
    data = res_single.json()
    assert data["id"] == first_id
    assert "text" in data
    assert len(data["text"]) > 10


def test_get_nonexistent_note(client):
    res = client.get("/notes/note_999999")
    assert res.status_code == 404


def test_decisions_post_and_get(client, tmp_path, monkeypatch):
    test_log = tmp_path / "decisions.jsonl"
    monkeypatch.setattr("app.store._get_log_path", lambda: test_log)

    payload = {
        "note_id": "note_01",
        "code": "BA41",
        "action": "approve",
        "reviewer": "test_clinician",
    }
    post_res = client.post("/decisions", json=payload)
    assert post_res.status_code == 200
    created = post_res.json()
    assert created["code"] == "BA41"
    assert created["action"] == "approve"
    assert "timestamp" in created

    # Fetch decisions filtered by note_id
    get_res = client.get("/decisions?note_id=note_01")
    assert get_res.status_code == 200
    decisions = get_res.json()
    assert len(decisions) >= 1
    assert decisions[-1]["code"] == "BA41"


def test_analyze_with_mocked_llm(client, monkeypatch):
    class FakeLLM:
        async def analyze(self, note_text: str):
            return [
                Suggestion(code="BA41", title="Angina pectoris", evidence_quote="angina pectoris"),
                Suggestion(code="ZZ99", title="Fake Disease", evidence_quote="denies fever"),
            ]

    monkeypatch.setattr("app.llm.get_llm_client", lambda: FakeLLM())

    res = client.post("/notes/note_01/analyze")
    assert res.status_code == 200
    data = res.json()
    assert "suggestions" in data
    suggestions = data["suggestions"]
    assert len(suggestions) == 2

    # First suggestion is valid and verified
    assert suggestions[0]["code"] == "BA41"
    assert suggestions[0]["status"] == "verified"
    assert suggestions[0]["start"] > 0

    # Second suggestion has invalid code
    assert suggestions[1]["code"] == "ZZ99"
    assert suggestions[1]["status"] == "rejected"


def test_cors_headers(client):
    # Test preflight for production Vercel app
    headers = {
        "Origin": "https://sugenhealth.vercel.app",
        "Access-Control-Request-Method": "GET",
    }
    res = client.options("/notes", headers=headers)
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "https://sugenhealth.vercel.app"

    # Test preview vercel deployment via regex
    headers_preview = {
        "Origin": "https://sugenhealth-preview-123.vercel.app",
        "Access-Control-Request-Method": "GET",
    }
    res_preview = client.options("/notes", headers=headers_preview)
    assert res_preview.status_code == 200
    assert res_preview.headers.get("access-control-allow-origin") == "https://sugenhealth-preview-123.vercel.app"

