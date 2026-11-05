import json
from pathlib import Path

from app.icd.base import ICDClient


class MockICD(ICDClient):
    def __init__(self, json_path: str | None = None):
        if json_path is None:
            # Default to apps/backend/data/mock_icd.json
            base_dir = Path(__file__).resolve().parent.parent.parent
            json_path = base_dir / "data" / "mock_icd.json"
        
        self.table: dict[str, str] = {}
        path = Path(json_path)
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            for entry in data:
                self.table[entry["code"]] = entry["title"]

    def code_exists(self, code: str) -> bool:
        return code in self.table

    def lookup(self, code: str) -> str | None:
        return self.table.get(code)
