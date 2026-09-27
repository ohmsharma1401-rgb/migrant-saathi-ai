import sys
import os
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent
if (ROOT_DIR / "app").exists():
    sys.path.insert(0, str(ROOT_DIR))
elif (ROOT_DIR.parent / "backend" / "app").exists():
    sys.path.insert(0, str(ROOT_DIR.parent / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token


def main():
    print("=" * 60)
    print("TESTING END-TO-END ASK SAATHI FASTAPI -> OLLAMA")
    print("=" * 60)

    # Generate test JWT token for demo user
    token = create_access_token({"sub": "00000000-0000-0000-0000-000000000001", "role": "worker"})
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Generated test JWT token: {token[:25]}...")

    with TestClient(app) as client:
        queries = [
            "the minimum wage for carpentry work",
            "What welfare schemes am I eligible for?",
            "How do I report an unsafe workplace?",
            "My employer hasn't paid me for 2 months. What should I do?",
            "Write a Python program to sort an array."
        ]

        for q in queries:
            print("\n" + "-" * 50)
            print(f"User Question: '{q}'")
            res = client.post("/api/ask-saathi/chat", json={
                "message": q,
                "language": "en"
            }, headers=headers)

            print(f"HTTP Status: {res.status_code}")
            if res.status_code == 200:
                resp_json = res.json()
                print(f"Classification: {resp_json.get('classification')}")
                print(f"Sources: {resp_json.get('sources')}")
                answer = resp_json.get("answer", "")
                print(f"Answer Length: {len(answer)} chars")
                print(f"ACTUAL ANSWER IN UI:\n{answer[:300]}...")
                assert answer != "Response generated.", "FAILED: Placeholder 'Response generated.' detected!"
                assert len(answer) > 10, "FAILED: Answer too short!"
                print(">>> PASSED: Valid response generated without placeholder!")
            else:
                print(f"Error: {res.text}")
                sys.exit(1)


if __name__ == "__main__":
    main()
