import time

import httpx

from app.config import get_settings
from app.icd.base import ICDClient


class LiveICD(ICDClient):
    """Client for the official WHO ICD-11 Cloud API with OAuth 2.0 client credentials,
    token caching, in-memory lookup caching, short timeouts, and fail-closed behavior.
    """

    TOKEN_ENDPOINT = "https://icdaccessmanagement.who.int/connect/token"

    def __init__(self):
        self.settings = get_settings()
        self.client_id = self.settings.ICD_CLIENT_ID
        self.client_secret = self.settings.ICD_CLIENT_SECRET
        self.release = self.settings.ICD_RELEASE or "2024-01"

        self._access_token: str | None = None
        self._token_expires_at: float = 0.0
        self._cache: dict[str, str | None] = {}

    def _get_token(self) -> str:
        # Return cached token if valid (with 60-second buffer)
        if self._access_token and time.time() < (self._token_expires_at - 60):
            return self._access_token

        if not self.client_id or not self.client_secret:
            raise RuntimeError("ICD_CLIENT_ID or ICD_CLIENT_SECRET not configured")

        with httpx.Client(timeout=5.0) as client:
            resp = client.post(
                self.TOKEN_ENDPOINT,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "scope": "icdapi_access",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            self._access_token = data["access_type"] if "access_type" in data else data["access_token"]
            expires_in = data.get("expires_in", 3600)
            self._token_expires_at = time.time() + expires_in
            return self._access_token

    def _request_icd(self, code: str) -> str | None:
        token = self._get_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "API-Version": "v2",
        }
        url = f"https://id.who.int/icd/release/11/{self.release}/mms/codeinfo/{code}"
        with httpx.Client(timeout=4.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            data = resp.json()
            return data.get("title", {}).get("@value") or data.get("stemId")

    def lookup(self, code: str) -> str | None:
        if code in self._cache:
            return self._cache[code]
        try:
            title = self._request_icd(code)
            self._cache[code] = title
            return title
        except Exception:
            # Raise so verifier fails closed to ICD_UNAVAILABLE
            raise

    def code_exists(self, code: str) -> bool:
        title = self.lookup(code)
        return title is not None
