"""
Welfare eligibility agent.
Applies deterministic filters then enriches results with Granite explanations.
"""
import json
import structlog
from datetime import date
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.welfare import WelfareScheme
from app.schemas.welfare import EligibilityCheckResponse, SchemeMatchResponse

logger = structlog.get_logger()


class WelfareAgent:
    async def check_eligibility(
        self, worker_profile, db: AsyncSession
    ) -> EligibilityCheckResponse:
        from app.services.watsonx_service import watsonx

        result = await db.execute(
            select(WelfareScheme).where(WelfareScheme.is_active == True)  # noqa: E712
        )
        schemes = result.scalars().all()

        # Compute worker age
        worker_age: Optional[int] = None
        if worker_profile.dob:
            today = date.today()
            worker_age = (
                today.year
                - worker_profile.dob.year
                - ((today.month, today.day) < (worker_profile.dob.month, worker_profile.dob.day))
            )

        potential_matches: List[SchemeMatchResponse] = []
        needs_verification: List[SchemeMatchResponse] = []

        for scheme in schemes:
            score, missing = self._compute_match(scheme, worker_profile, worker_age)
            if score <= 0:
                continue

            status = "potentially_eligible" if score >= 0.6 else "needs_verification"
            explanation = self._build_deterministic_explanation(scheme, worker_profile, score)

            if watsonx.is_available():
                try:
                    prompt = (
                        f"Use ONLY the scheme data provided. Do not invent schemes.\n"
                        f"Scheme: {scheme.name}\n"
                        f"Description: {scheme.description}\n"
                        f"Target sectors: {', '.join(scheme.target_sectors or [])}\n"
                        f"Applicable states: {', '.join(scheme.applicable_states or [])}\n"
                        f"Benefits: {scheme.benefits_summary}\n\n"
                        f"Worker profile:\n"
                        f"- Origin state: {worker_profile.origin_state}\n"
                        f"- Current district: {worker_profile.current_district}\n"
                        f"- Age: {worker_age}\n\n"
                        f"Use 'Potentially Eligible' or 'Needs Verification'. "
                        f"Explain in 2-3 sentences why this worker may qualify based on their profile. "
                        f"Do not make legal conclusions."
                    )
                    ai_text = watsonx.generate(prompt)
                    if ai_text:
                        explanation = ai_text
                except Exception as e:
                    logger.warning("welfare_agent_granite_failed", error=str(e))

            match = SchemeMatchResponse(
                scheme_name=scheme.name,
                scheme_code=scheme.scheme_code,
                status=status,
                reason=explanation,
                match_score=round(score, 2),
                missing_information=missing,
                required_documents=scheme.required_documents or [],
                ai_explanation=explanation,
            )

            if status == "potentially_eligible":
                potential_matches.append(match)
            else:
                needs_verification.append(match)

        recommendations = self._build_recommendations(potential_matches, needs_verification)

        worker_summary = {
            "worker_id": str(worker_profile.id),
            "full_name": worker_profile.full_name,
            "origin_state": worker_profile.origin_state,
            "current_district": worker_profile.current_district,
            "age": worker_age,
            "total_schemes_checked": len(schemes),
        }

        return EligibilityCheckResponse(
            worker_summary=worker_summary,
            potential_matches=potential_matches,
            needs_verification=needs_verification,
            recommendations=recommendations,
        )

    def _compute_match(
        self, scheme: WelfareScheme, worker_profile, worker_age: Optional[int]
    ):
        score = 0.0
        missing: List[str] = []
        checks = 0

        # State match
        if scheme.applicable_states:
            checks += 1
            if (
                worker_profile.origin_state in scheme.applicable_states
                or worker_profile.current_district in scheme.applicable_states
            ):
                score += 1
            else:
                missing.append("State eligibility")
                return 0.0, missing  # hard filter

        # Age range
        if scheme.min_age is not None or scheme.max_age is not None:
            checks += 1
            if worker_age is None:
                missing.append("Date of birth required for age verification")
            elif scheme.min_age and worker_age < scheme.min_age:
                return 0.0, [f"Minimum age is {scheme.min_age}"]
            elif scheme.max_age and worker_age > scheme.max_age:
                return 0.0, [f"Maximum age is {scheme.max_age}"]
            else:
                score += 1

        if checks == 0:
            # No hard filters — moderate base score
            score = 0.5
            checks = 1

        return score / max(checks, 1), missing

    def _build_deterministic_explanation(
        self, scheme: WelfareScheme, worker_profile, score: float
    ) -> str:
        status_label = "Potentially Eligible" if score >= 0.6 else "Needs Verification"
        return (
            f"{status_label}: Based on the worker's profile from {worker_profile.origin_state}, "
            f"they may qualify for {scheme.name}. "
            f"Benefits include: {scheme.benefits_summary or 'see scheme details'}."
        )

    def _build_recommendations(
        self,
        potential: List[SchemeMatchResponse],
        needs_check: List[SchemeMatchResponse],
    ) -> List[str]:
        recs = []
        if potential:
            recs.append(
                f"You may qualify for {len(potential)} welfare scheme(s). Review them promptly."
            )
        if needs_check:
            recs.append(
                f"{len(needs_check)} scheme(s) need additional information to confirm eligibility."
            )
        if not potential and not needs_check:
            recs.append(
                "No matching schemes found at this time. Ensure your profile is complete."
            )
        return recs


welfare_agent = WelfareAgent()
