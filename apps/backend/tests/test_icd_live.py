import httpx
import pytest
import respx

from app.icd.client import LiveICD


@respx.mock
def test_live_icd_client_success():
    # Mock OAuth token request
    respx.post(LiveICD.TOKEN_ENDPOINT).mock(
        return_value=httpx.Response(
            200,
            json={"access_token": "mocked_jwt_token", "expires_in": 3600},
        )
    )

    # Mock ICD lookup request
    respx.get("https://id.who.int/icd/release/11/2024-01/mms/codeinfo/BA41").mock(
        return_value=httpx.Response(
            200,
            json={"stemId": "BA41", "title": {"@value": "Angina pectoris"}},
        )
    )

    client = LiveICD()
    client.client_id = "test_id"
    client.client_secret = "test_secret"
    client.release = "2024-01"

    assert client.code_exists("BA41") is True
    assert client.lookup("BA41") == "Angina pectoris"


@respx.mock
def test_live_icd_client_fails_closed_when_unreachable():
    respx.post(LiveICD.TOKEN_ENDPOINT).mock(
        return_value=httpx.Response(500, text="Internal Server Error")
    )

    client = LiveICD()
    client.client_id = "test_id"
    client.client_secret = "test_secret"

    with pytest.raises(Exception):
        client.code_exists("BA41")
