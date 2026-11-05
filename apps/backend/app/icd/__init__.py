from app.config import get_settings
from app.icd.base import ICDClient
from app.icd.client import LiveICD
from app.icd.mock import MockICD

_icd_instance = None


def get_icd_client() -> ICDClient:
    global _icd_instance
    if _icd_instance is None:
        settings = get_settings()
        if settings.ICD_MODE.lower() == "live":
            _icd_instance = LiveICD()
        else:
            _icd_instance = MockICD()
    return _icd_instance
