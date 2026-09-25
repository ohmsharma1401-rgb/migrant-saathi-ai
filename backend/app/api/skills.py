from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.new_features import SkillExtractMatchRequest, SkillExtractMatchResponse
from app.services.skill_extraction_service import skill_extraction_service

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.post("/extract-and-match", response_model=SkillExtractMatchResponse)
async def extract_and_match_skills(
    payload: SkillExtractMatchRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await skill_extraction_service.extract_and_match(text=payload.text, db=db)
    return SkillExtractMatchResponse(
        extracted_skills=result["extracted_skills"],
        matched_jobs=result["matched_jobs"],
    )
