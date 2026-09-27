import sys
import os
import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, patch
import httpx
import pytest

# Ensure UTF-8 console output for Indian Rupee symbol (₹) on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Setup Python module search path so 'app' is importable whether run from root or backend/
ROOT_DIR = Path(__file__).resolve().parent
if (ROOT_DIR / "backend").exists():
    sys.path.insert(0, str(ROOT_DIR / "backend"))
elif (ROOT_DIR / "app").exists():
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.services.domain_classifier import domain_classifier
from app.services.knowledge_service import knowledge_service
from app.services.ollama_service import ollama_service
from app.services.ask_saathi_service import ask_saathi_service
from app.services.conversation_service import conversation_service
from app.core.security import create_access_token


def test_ask_saathi_endpoints_exist():
    """1. Verify Ask Saathi API endpoints exist on the FastAPI application."""
    routes = [r.path for r in app.routes]
    assert "/api/ask-saathi/chat" in routes, "Endpoint /api/ask-saathi/chat missing!"
    assert "/api/ask-saathi/health" in routes, "Endpoint /api/ask-saathi/health missing!"
    assert "/api/ask-saathi/conversations/new" in routes, "Endpoint /api/ask-saathi/conversations/new missing!"


def test_valid_migrant_worker_questions_reach_service():
    """2. Verify valid migrant worker questions are properly classified as in_scope."""
    in_scope_samples = [
        "the minimum wage for carpentry work",
        "What welfare schemes am I eligible for?",
        "How do I report an unsafe workplace?",
        "My employer hasn't paid me for 2 months. What should I do?",
        "BOCW registration benefits in Gujarat",
        "PM-SYM pension eligibility and documents",
        "e-Shram card benefits for construction labour"
    ]
    for q in in_scope_samples:
        cls, rej_msg = domain_classifier.classify(q, "en")
        assert cls == "in_scope", f"Query '{q}' was unexpectedly classified as {cls}"
        assert not rej_msg, f"Rejection message was unexpectedly returned for in-scope query '{q}': {rej_msg}"


def test_ollama_response_parsed_from_message_content():
    """3. Verify Ollama chat response is parsed from message.content."""
    mock_payload = {
        "model": "llama3",
        "message": {
            "role": "assistant",
            "content": "The official Gujarat minimum wage for skilled carpenters is ₹520 per day."
        },
        "done": True
    }

    mock_resp = httpx.Response(200, json=mock_payload)
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        messages = [
            {"role": "system", "content": "You are Saathi."},
            {"role": "user", "content": "the minimum wage for carpentry work"}
        ]
        result = asyncio.run(ollama_service.chat_completion(messages))
        assert result == "The official Gujarat minimum wage for skilled carpenters is ₹520 per day."
        assert result != "Response generated."


def test_actual_answer_returned_to_api_caller():
    """4. Verify the actual answer is returned to the frontend/API caller."""
    token = create_access_token({"sub": "00000000-0000-0000-0000-000000000001", "role": "worker"})
    headers = {"Authorization": f"Bearer {token}"}

    sample_answer = "The minimum wage for skilled carpentry work is ₹480 - ₹530 per day."
    with patch.object(ollama_service, "chat_completion", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = sample_answer

        with TestClient(app) as client:
            res = client.post("/api/ask-saathi/chat", json={
                "message": "the minimum wage for carpentry work",
                "language": "en"
            }, headers=headers)

            assert res.status_code == 200
            data = res.json()
            assert data["answer"] == sample_answer
            assert data["classification"] == "in_scope"
            assert "conversation_id" in data


def test_response_generated_bug_never_returned():
    """
    5 & 11. CRITICAL REGRESSION TEST FOR BUG:
    Verifies that when Ollama returns a real answer,
    the endpoint returns that answer and NEVER returns 'Response generated.'.
    """
    token = create_access_token({"sub": "00000000-0000-0000-0000-000000000001", "role": "worker"})
    headers = {"Authorization": f"Bearer {token}"}

    real_answer = "The applicable wage information is ₹520 per day under Gujarat Labour reference standards."

    with patch.object(ollama_service, "chat_completion", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = real_answer

        with TestClient(app) as client:
            res = client.post("/api/ask-saathi/chat", json={
                "message": "the minimum wage for carpentry work",
                "language": "en"
            }, headers=headers)

            assert res.status_code == 200
            resp_data = res.json()
            answer = resp_data.get("answer", "")

            # MUST return the actual answer
            assert answer == real_answer
            # MUST NOT return the placeholder
            assert answer != "Response generated.", "CRITICAL BUG: 'Response generated.' placeholder was returned!"
            assert "Response generated." not in answer


def test_out_of_scope_question_receives_proper_domain_response():
    """6. Verify out-of-scope question receives proper domain response and Ollama is not called."""
    out_of_scope_queries = [
        "Write a Python script to sort an array",
        "Who won the cricket match yesterday?",
        "What is the capital of France?",
        "Tell me a funny joke"
    ]

    with patch.object(ollama_service, "chat_completion", new_callable=AsyncMock) as mock_chat:
        with TestClient(app) as client:
            for q in out_of_scope_queries:
                res = client.post("/api/ask-saathi/chat", json={
                    "message": q,
                    "language": "en"
                })
                assert res.status_code == 200
                data = res.json()
                assert data["classification"] == "out_of_scope"
                assert "Migrant Saathi" in data["answer"]
                assert data["answer"] != "Response generated."

        # Ollama chat_completion must never be called for out-of-scope questions
        mock_chat.assert_not_called()


def test_conversation_isolation_preserved():
    """7. Verify conversation isolation between different workers."""
    user_a = "00000000-0000-0000-0000-000000000001"
    user_b = "00000000-0000-0000-0000-000000000002"

    token_a = create_access_token({"sub": user_a, "role": "worker"})
    token_b = create_access_token({"sub": user_b, "role": "worker"})

    with patch.object(ollama_service, "chat_completion", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = "Guidance response."

        with TestClient(app) as client:
            # User A starts conversation
            res_a = client.post("/api/ask-saathi/chat", json={
                "message": "Question from worker A regarding safety equipment",
                "language": "en"
            }, headers={"Authorization": f"Bearer {token_a}"})
            assert res_a.status_code == 200
            conv_id_a = res_a.json()["conversation_id"]

            # User B starts conversation
            res_b = client.post("/api/ask-saathi/chat", json={
                "message": "Question from worker B regarding minimum wages",
                "language": "en"
            }, headers={"Authorization": f"Bearer {token_b}"})
            assert res_b.status_code == 200
            conv_id_b = res_b.json()["conversation_id"]

            # Conversations must have distinct IDs
            assert conv_id_a != conv_id_b, "Conversation IDs must not leak between users!"


def test_ollama_failure_produces_error_response_not_fake_success():
    """8. Verify Ollama failure produces a real error response rather than fake success."""
    with patch.object(ollama_service, "chat_completion", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = None  # Simulates Ollama timeout or server down

        with TestClient(app) as client:
            res = client.post("/api/ask-saathi/chat", json={
                "message": "the minimum wage for carpentry work",
                "language": "en"
            })
            assert res.status_code == 200
            data = res.json()
            assert data["classification"] == "service_unavailable"
            assert "temporarily unavailable" in data["answer"]
            assert data["answer"] != "Response generated."


def test_empty_or_invalid_question_handled():
    """9. Verify empty or whitespace-only questions return 400 Bad Request."""
    with TestClient(app) as client:
        res = client.post("/api/ask-saathi/chat", json={"message": "   "})
        assert res.status_code == 400
        assert "cannot be empty" in res.json()["detail"]

        res2 = client.post("/api/ask-saathi/chat", json={"message": ""})
        assert res2.status_code == 400
        assert "cannot be empty" in res2.json()["detail"]


def test_integration_live_ollama_if_available():
    """10. Live Ollama test: executes against actual local Ollama server if running."""
    st = asyncio.run(ollama_service.get_status())
    if not st.get("available"):
        pytest.skip("Local Ollama server is offline; skipping live inference test.")

    with TestClient(app) as client:
        res = client.post("/api/ask-saathi/chat", json={
            "message": "the minimum wage for carpentry work",
            "language": "en"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["classification"] == "in_scope"
        assert len(data["answer"]) > 20
        assert data["answer"] != "Response generated."
