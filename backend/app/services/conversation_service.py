import uuid
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.conversation import Conversation, ConversationMessage

logger = logging.getLogger(__name__)


class ConversationService:
    """Manages isolated user conversations and message history in PostgreSQL / SQLite."""

    async def get_or_create_conversation(
        self,
        db: AsyncSession,
        user_id: str,
        conversation_id: Optional[str] = None,
        language: str = "en"
    ) -> Conversation:
        """Finds active conversation owned by user or creates a new one."""
        if conversation_id:
            try:
                c_uuid = uuid.UUID(str(conversation_id))
                stmt = select(Conversation).where(
                    Conversation.id == c_uuid,
                    Conversation.user_id == user_id,
                    Conversation.status == "active"
                )
                res = await db.execute(stmt)
                conv = res.scalars().first()
                if conv:
                    return conv
            except Exception as e:
                logger.warning(f"Invalid conversation_id format: {e}")

        # Create new conversation for user
        new_conv = Conversation(
            id=uuid.uuid4(),
            user_id=user_id,
            title="Ask Saathi Session",
            language=language,
            status="active"
        )
        db.add(new_conv)
        await db.commit()
        await db.refresh(new_conv)
        return new_conv

    async def create_new_conversation(
        self,
        db: AsyncSession,
        user_id: str,
        language: str = "en"
    ) -> Conversation:
        """Explicitly starts a brand new conversation context for the worker."""
        new_conv = Conversation(
            id=uuid.uuid4(),
            user_id=user_id,
            title="Ask Saathi Session",
            language=language,
            status="active"
        )
        db.add(new_conv)
        await db.commit()
        await db.refresh(new_conv)
        return new_conv

    async def check_duplicate_message(
        self,
        db: AsyncSession,
        conversation_id: uuid.UUID,
        message_id: Optional[str]
    ) -> Optional[Tuple[str, str, List[str]]]:
        """
        Deduplicates requests by message_id.
        Returns (user_content, assistant_content, sources) if duplicate is found.
        """
        if not message_id:
            return None

        stmt = select(ConversationMessage).where(
            ConversationMessage.conversation_id == conversation_id,
            ConversationMessage.message_id == message_id
        )
        res = await db.execute(stmt)
        msg = res.scalars().first()
        if not msg:
            return None

        # Find corresponding assistant message sequence
        stmt_ast = select(ConversationMessage).where(
            ConversationMessage.conversation_id == conversation_id,
            ConversationMessage.sequence_number == msg.sequence_number + 1
        )
        res_ast = await db.execute(stmt_ast)
        ast_msg = res_ast.scalars().first()

        ast_content = ast_msg.content if ast_msg else "Processing complete."
        sources = ast_msg.sources if ast_msg and ast_msg.sources else []
        return (msg.content, ast_content, sources)

    async def get_recent_history(
        self,
        db: AsyncSession,
        conversation_id: uuid.UUID,
        limit: int = 10
    ) -> List[Dict[str, str]]:
        """Retrieves last N messages formatted for LLM conversation context."""
        stmt = (
            select(ConversationMessage)
            .where(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.sequence_number.desc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        messages = list(res.scalars().all())
        messages.reverse()  # Chronological order

        history = []
        for m in messages:
            history.append({
                "role": m.role,
                "content": m.content
            })
        return history

    async def add_message_pair(
        self,
        db: AsyncSession,
        conversation_id: uuid.UUID,
        user_content: str,
        assistant_content: str,
        classification: str,
        sources: List[str],
        message_id: Optional[str] = None
    ) -> Tuple[ConversationMessage, ConversationMessage]:
        """Atomically appends user question and assistant answer with deterministic sequence numbers."""
        # Get max sequence number for this conversation
        stmt = select(func.max(ConversationMessage.sequence_number)).where(
            ConversationMessage.conversation_id == conversation_id
        )
        res = await db.execute(stmt)
        max_seq = res.scalar() or 0

        user_msg = ConversationMessage(
            id=uuid.uuid4(),
            conversation_id=conversation_id,
            message_id=message_id,
            role="user",
            content=user_content,
            classification=classification,
            sequence_number=max_seq + 1
        )
        db.add(user_msg)

        assistant_msg = ConversationMessage(
            id=uuid.uuid4(),
            conversation_id=conversation_id,
            message_id=f"{message_id}_resp" if message_id else None,
            role="assistant",
            content=assistant_content,
            classification=classification,
            sources=sources,
            sequence_number=max_seq + 2
        )
        db.add(assistant_msg)

        await db.commit()
        await db.refresh(user_msg)
        await db.refresh(assistant_msg)

        return user_msg, assistant_msg


conversation_service = ConversationService()
