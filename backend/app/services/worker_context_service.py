import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.worker import WorkerProfile

logger = logging.getLogger(__name__)


class WorkerContextService:
    """Retrieves verified worker profile attributes for RAG personalization without inventing missing data."""

    async def get_worker_context(self, db: AsyncSession, user_id: str) -> Optional[str]:
        """
        Returns a concise, verified worker context string for system prompt injection.
        """
        if not user_id:
            return None

        try:
            stmt = select(WorkerProfile).where(WorkerProfile.user_id == user_id)
            res = await db.execute(stmt)
            profile = res.scalars().first()

            if not profile:
                return None

            parts = [f"Worker Name: {profile.full_name}"]
            if profile.origin_state:
                parts.append(f"Origin State: {profile.origin_state}")
            if profile.current_district or profile.current_city:
                parts.append(f"Current Location: {profile.current_city or profile.current_district}")
            if profile.preferred_language:
                parts.append(f"Preferred Language: {profile.preferred_language}")

            # Skills
            if hasattr(profile, "skills") and profile.skills:
                skill_names = [s.skill.name for s in profile.skills if hasattr(s, "skill") and s.skill]
                if skill_names:
                    parts.append(f"Registered Skills: {', '.join(skill_names)}")

            return " | ".join(parts)
        except Exception as e:
            logger.warning(f"Failed to fetch worker context: {e}")

        return None


worker_context_service = WorkerContextService()
