import httpx
import asyncio
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from app.core.security import create_access_token

async def main():
    print("=" * 60)
    print("TESTING END-TO-END ASK SAATHI FASTAPI -> OLLAMA")
    print("=" * 60)

    # Generate test JWT token for demo user
    token = create_access_token({"sub": "00000000-0000-0000-0000-000000000001", "role": "worker"})
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Generated test JWT token: {token[:25]}...")

    async with httpx.AsyncClient(timeout=90.0) as client:
        queries = [
            "hey, is there any employer in ahmedabad i have experience in electrical wiring",
            "What welfare schemes am I eligible for?",
            "Write a Python program to sort an array."
        ]

        for q in queries:
            print("\n" + "-" * 50)
            print(f"User Question: '{q}'")
            res = await client.post("http://127.0.0.1:8000/api/ask-saathi/chat", json={
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
                print(f"ACTUAL ANSWER IN UI:\n{answer[:400]}")
                assert answer != "Response generated.", "FAILED: Placeholder 'Response generated.' detected!"
                assert len(answer) > 10, "FAILED: Answer too short!"
            else:
                print(f"Error: {res.text}")

if __name__ == "__main__":
    asyncio.run(main())
