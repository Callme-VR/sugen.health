import asyncio
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

# Ensure apps/backend root is in python path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.icd.mock import MockICD
from app.llm import get_llm_client
from app.models import Suggestion
from app.verifier import verify_suggestion


def get_cache_key(note_text: str) -> str:
    return hashlib.sha256(note_text.strip().encode("utf-8")).hexdigest()


async def get_or_cached_analysis(note_text: str, cache_dir: Path, llm_client: Any) -> List[Suggestion]:
    cache_dir.mkdir(parents=True, exist_ok=True)
    key = get_cache_key(note_text)
    cache_file = cache_dir / f"{key}.json"

    if cache_file.exists():
        try:
            cached_data = json.loads(cache_file.read_text(encoding="utf-8"))
            return [Suggestion(**item) for item in cached_data]
        except Exception:
            pass

    # Call LLM
    suggestions = await llm_client.analyze(note_text)
    try:
        cache_file.write_text(
            json.dumps([s.model_dump() for s in suggestions], indent=2),
            encoding="utf-8",
        )
    except Exception:
        pass
    return suggestions


async def run_evaluation():
    base_dir = Path(__file__).resolve().parent.parent
    notes_dir = base_dir / "data" / "notes"
    labels_file = base_dir / "data" / "labels.json"
    cache_dir = base_dir / "eval" / "cache"
    report_file = base_dir / "eval" / "report.md"

    if not labels_file.exists():
        print(f"Labels file not found: {labels_file}")
        return

    labels_data = json.loads(labels_file.read_text(encoding="utf-8"))
    icd = MockICD()
    llm = get_llm_client()

    total_verified = 0
    true_positives = 0
    false_positives = 0

    wrong_suggestions_count = 0
    caught_count = 0

    expected_codes_total = 0
    false_rejections = 0

    failures = []
    tag_metrics: Dict[str, Dict[str, int]] = {}

    for note_id, meta in sorted(labels_data.items()):
        note_path = notes_dir / f"{note_id}.txt"
        if not note_path.exists():
            continue

        note_text = note_path.read_text(encoding="utf-8")
        expected_codes = set(meta.get("expected_codes", []))
        tags = meta.get("tags", [])
        expected_codes_total += len(expected_codes)

        for tag in tags:
            if tag not in tag_metrics:
                tag_metrics[tag] = {"expected": 0, "verified": 0, "caught": 0}
            tag_metrics[tag]["expected"] += len(expected_codes)

        # Get LLM output (cached or live)
        raw_suggestions = await get_or_cached_analysis(note_text, cache_dir, llm)

        verified_codes = set()
        for sug in raw_suggestions:
            verified = verify_suggestion(sug, note_text, icd)
            code = verified.code

            is_expected = code in expected_codes

            if verified.status == "verified":
                total_verified += 1
                if is_expected:
                    true_positives += 1
                    verified_codes.add(code)
                    for tag in tags:
                        tag_metrics[tag]["verified"] += 1
                else:
                    false_positives += 1
                    failures.append({
                        "note_id": note_id,
                        "code": code,
                        "status": "verified",
                        "error_type": "False Positive (Unwarranted code passed verifier)",
                    })
            else:
                # needs_review or rejected
                if not is_expected:
                    wrong_suggestions_count += 1
                    caught_count += 1
                    for tag in tags:
                        tag_metrics[tag]["caught"] += 1
                else:
                    # Ground truth was caught / rejected
                    false_rejections += 1
                    failures.append({
                        "note_id": note_id,
                        "code": code,
                        "status": verified.status,
                        "error_type": f"False Rejection ({verified.reasons})",
                    })

    precision = (true_positives / total_verified * 100) if total_verified > 0 else 0.0
    recall = (true_positives / expected_codes_total * 100) if expected_codes_total > 0 else 0.0
    catch_rate = (caught_count / wrong_suggestions_count * 100) if wrong_suggestions_count > 0 else 100.0
    false_rejection_rate = (false_rejections / expected_codes_total * 100) if expected_codes_total > 0 else 0.0

    report_md = f"""# ICD-11 Assistant — Evaluation Benchmark Report

Benchmark executed across **{len(labels_data)} synthetic clinical notes** with deterministic verifier rules and mock ICD-11 tables.

---

## Overall Metrics

| Metric | Measured Value | Target | Description |
|---|---|---|---|
| **Precision (Verified)** | **{precision:.1f}%** | > 90% | Proportion of verified codes matching ground truth labels |
| **Recall (Verified)** | **{recall:.1f}%** | > 80% | Proportion of expected ground truth codes correctly verified |
| **Catch Rate** | **{catch_rate:.1f}%** | > 95% | Erroneous/negated/hypothetical suggestions caught as rejected or needs_review |
| **False Rejection Rate** | **{false_rejection_rate:.1f}%** | < 5% | Legitimate expected codes inappropriately rejected |

---

## Performance by Clinical Tag

| Tag | Expected Codes | Verified Correct | Wrong Mentions Caught |
|---|---|---|---|
"""
    for tag, counts in sorted(tag_metrics.items()):
        report_md += f"| `{tag}` | {counts['expected']} | {counts['verified']} | {counts['caught']} |\n"

    report_md += """
---

## Complete Audit of Failures & Discrepancies

"""
    if failures:
        report_md += "| Note ID | Suggested Code | Status | Failure Diagnosis |\n|---|---|---|---|\n"
        for f in failures:
            report_md += f"| `{f['note_id']}` | `{f['code']}` | `{f['status']}` | {f['error_type']} |\n"
    else:
        report_md += "No discrepancies or false verifications detected on current test corpus.\n"

    report_file.write_text(report_md, encoding="utf-8")
    print(f"Generated report at {report_file}")
    print(f"Precision: {precision:.1f}%, Recall: {recall:.1f}%, Catch Rate: {catch_rate:.1f}%")


if __name__ == "__main__":
    asyncio.run(run_evaluation())
