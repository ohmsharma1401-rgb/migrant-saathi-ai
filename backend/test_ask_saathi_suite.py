import asyncio
import logging
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.domain_classifier import domain_classifier, OUT_OF_SCOPE_RESPONSES
from app.services.knowledge_service import knowledge_service
from app.services.ollama_service import ollama_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_suite")


async def run_ask_saathi_tests():
    print("=" * 60)
    print("MIGRANT SAATHI — ASK SAATHI TEST SUITE")
    print("=" * 60)

    # 1. Health & Ollama Status Test
    print("\n1. Testing Ollama Status & Connection:")
    st = await ollama_service.get_status()
    print(f"   Available: {st['available']}")
    print(f"   Active Model: {st.get('active_model')}")
    print(f"   Message: {st.get('message')}")
    assert "installed_models" in st, "Health check failed"

    # 2. Domain Classification Test
    print("\n2. Testing Domain Classifier (In-Scope vs Out-Of-Scope):")
    test_queries = [
        ("What is BOCW?", "in_scope"),
        ("Who is eligible for PM-SYM?", "in_scope"),
        ("My contractor has not paid my wages for 2 months.", "in_scope"),
        ("I moved to Gujarat from Bihar and need help finding work.", "in_scope"),
        ("I work as a mason. Which schemes apply to me?", "in_scope"),
        ("How to report an unsafe workplace?", "in_scope"),
        ("What documents do I need to register?", "in_scope"),
        ("Write a Python program to sort an array.", "out_of_scope"),
        ("Who won the cricket match?", "out_of_scope"),
        ("Tell me a joke.", "out_of_scope"),
        ("What is the capital of France?", "out_of_scope"),
        ("Give me a cooking recipe.", "out_of_scope"),
    ]

    for q, expected in test_queries:
        cls, rej_msg = domain_classifier.classify(q, "en")
        status = "PASSED" if cls == expected else "FAILED"
        print(f"   [{status}] Query: '{q}' -> Classified: '{cls}' (Expected: '{expected}')")
        assert cls == expected, f"Classification failed for '{q}': got {cls}"

    # 3. Knowledge Retrieval Test
    print("\n3. Testing Knowledge Retrieval Layer:")
    class DummyDB:
        async def execute(self, stmt):
            class DummyResult:
                def scalars(self):
                    class DummyScalars:
                        def all(self): return []
                        def first(self): return None
                    return DummyScalars()
            return DummyResult()

    dummy_db = DummyDB()
    k_text, sources, k_found = await knowledge_service.retrieve_relevant_knowledge(dummy_db, "What is BOCW registration?", "en")
    print(f"   BOCW Knowledge Found: {k_found}")
    print(f"   Sources: {sources}")
    assert k_found, "BOCW knowledge was not retrieved"

    k_text_wage, sources_wage, k_found_wage = await knowledge_service.retrieve_relevant_knowledge(dummy_db, "What is the minimum wage for a mason in Gujarat?", "en")
    print(f"   Mason Minimum Wage Knowledge Found: {k_found_wage}")
    print(f"   Sources: {sources_wage}")
    assert k_found_wage, "Wage knowledge was not retrieved"

    # 4. Out-of-Scope Fixed Response Test in EN, HI, GU
    print("\n4. Testing Out-of-Scope Rejection Messages:")
    for lang in ["en", "hi", "gu"]:
        cls, msg = domain_classifier.classify("Write Python code", lang)
        print(f"   [{lang.upper()}] Rejection Msg snippet: {msg[:60]}...")
        assert "Migrant Saathi" in msg or "પ્રવાસી સાથી" in msg or "प्रवासी साथी" in msg

    # 5. Critical 10-Question Conversation Sequential Test
    print("\n5. Testing 10-Question Sequential Conversation Test (Q1-Q9 In-Scope, Q10 Out-of-Scope):")
    sequential_queries = [
        "What is BOCW?",
        "Who is eligible?",
        "What documents are required?",
        "How can I apply?",
        "What benefits are available?",
        "My contractor has not paid me.",
        "What can I do about that?",
        "What schemes may be relevant to me?",
        "Tell me about PM-SYM.",
        "Write a Python program."
    ]

    for idx, q_text in enumerate(sequential_queries, 1):
        cls, _ = domain_classifier.classify(q_text, "en")
        expected_cls = "out_of_scope" if idx == 10 else "in_scope"
        print(f"   Q{idx}: '{q_text}' -> Classification: {cls} (Expected: {expected_cls})")
        assert cls == expected_cls, f"Sequential test failed at Q{idx}"

    print("\n" + "=" * 60)
    print("ALL TEST SUITE CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_ask_saathi_tests())
