"""
Wage fairness agent — compares reported wages against reference data
and generates a plain-English explanation via IBM Granite.
"""
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wage import ReferenceWage
from app.schemas.wages import WageCheckResponse

logger = structlog.get_logger()


class WageAgent:
    async def check_wage_fairness(
        self,
        reported_wage: float,
        occupation: str,
        district: str,
        state: str,
        skill_level: str,
        db: AsyncSession,
    ) -> WageCheckResponse:
        from app.services.watsonx_service import watsonx

        # Attempt exact match, then district-agnostic fallback
        result = await db.execute(
            select(ReferenceWage)
            .where(ReferenceWage.state == state)
            .where(ReferenceWage.occupation.ilike(f"%{occupation}%"))
            .where(ReferenceWage.skill_level == skill_level)
            .where(ReferenceWage.is_active == True)  # noqa: E712
            .order_by(
                # prefer district match
                (ReferenceWage.district == district).desc()
            )
            .limit(1)
        )
        ref = result.scalar_one_or_none()

        if ref is None:
            explanation = (
                f"No reference wage data found for '{occupation}' in {district}, {state} "
                f"at skill level '{skill_level}'. Unable to make a comparison."
            )
            return WageCheckResponse(
                reported_wage=reported_wage,
                reference_wage=0.0,
                min_wage=0.0,
                discrepancy_amount=0.0,
                discrepancy_percent=0.0,
                risk_level="monitor",
                ai_explanation=explanation,
                data_source="N/A — reference data not available for this occupation/location",
            )

        reference_daily_wage = float(ref.reference_daily_wage)
        min_daily_wage = float(ref.min_daily_wage)
        discrepancy_amount = reference_daily_wage - reported_wage
        discrepancy_percent = (
            (discrepancy_amount / reference_daily_wage) * 100 if reference_daily_wage > 0 else 0
        )

        risk_level = self._assess_risk(discrepancy_percent)

        explanation = self._deterministic_explanation(
            reported_wage, reference_daily_wage, min_daily_wage, discrepancy_percent, risk_level, occupation
        )

        if watsonx.is_available():
            try:
                prompt = (
                    f"A migrant worker in {district}, {state} reports earning ₹{reported_wage}/day "
                    f"as a {occupation} ({skill_level} level).\n"
                    f"The reference daily wage for this role is ₹{reference_daily_wage}, "
                    f"minimum wage is ₹{min_daily_wage}.\n"
                    f"Discrepancy: ₹{discrepancy_amount:.2f} ({discrepancy_percent:.1f}%).\n\n"
                    f"Write 2-3 sentences for a labour officer summarising this situation. "
                    f"Use 'potential discrepancy' language. Do not make legal conclusions."
                )
                ai_text = watsonx.generate(prompt)
                if ai_text:
                    explanation = ai_text
            except Exception as e:
                logger.warning("wage_agent_granite_failed", error=str(e))

        return WageCheckResponse(
            reported_wage=reported_wage,
            reference_wage=reference_daily_wage,
            min_wage=min_daily_wage,
            discrepancy_amount=round(discrepancy_amount, 2),
            discrepancy_percent=round(discrepancy_percent, 1),
            risk_level=risk_level,
            ai_explanation=explanation,
            data_source=ref.source,
        )

    def _assess_risk(self, discrepancy_percent: float) -> str:
        if discrepancy_percent < 5:
            return "normal"
        if discrepancy_percent < 20:
            return "monitor"
        if discrepancy_percent < 40:
            return "potential_discrepancy"
        return "high_priority_review"

    def _deterministic_explanation(
        self,
        reported: float,
        reference: float,
        minimum: float,
        pct: float,
        risk: str,
        occupation: str,
    ) -> str:
        if risk == "normal":
            return (
                f"The reported wage of ₹{reported}/day for {occupation} is within the expected range "
                f"(reference: ₹{reference}/day). No concerns at this time."
            )
        if risk == "monitor":
            return (
                f"The reported wage of ₹{reported}/day for {occupation} is {pct:.1f}% below the "
                f"reference wage of ₹{reference}/day. This warrants monitoring."
            )
        if risk == "potential_discrepancy":
            return (
                f"A potential discrepancy has been identified: the reported wage of ₹{reported}/day "
                f"is {pct:.1f}% below the reference wage of ₹{reference}/day for {occupation}. "
                f"Further review is recommended."
            )
        return (
            f"High-priority review: the reported wage of ₹{reported}/day is {pct:.1f}% below the "
            f"reference wage of ₹{reference}/day for {occupation}. Minimum wage is ₹{minimum}/day. "
            f"Immediate follow-up is advised."
        )


wage_agent = WageAgent()
