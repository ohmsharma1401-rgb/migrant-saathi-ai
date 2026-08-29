from pydantic import BaseModel


class WageCheckRequest(BaseModel):
    reported_daily_wage: float
    occupation: str
    district: str
    state: str = "Gujarat"
    skill_level: str = "skilled"


class WageCheckResponse(BaseModel):
    reported_wage: float
    reference_wage: float
    min_wage: float
    discrepancy_amount: float
    discrepancy_percent: float
    risk_level: str  # normal / monitor / potential_discrepancy / high_priority_review
    ai_explanation: str
    data_source: str
