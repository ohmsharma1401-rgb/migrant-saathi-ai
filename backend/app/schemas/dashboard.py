from typing import Any, Dict, List

from pydantic import BaseModel


class DashboardOverview(BaseModel):
    total_workers: int
    total_welfare_matches: int
    total_wage_alerts: int
    total_grievances: int
    high_priority_cases: int
    open_safety_issues: int


class ChartData(BaseModel):
    workers_by_sector: List[Dict[str, Any]] = []
    workers_by_district: List[Dict[str, Any]] = []
    top_skills: List[Dict[str, Any]] = []
    grievances_by_category: List[Dict[str, Any]] = []


class AIInsight(BaseModel):
    text: str
    insight_type: str  # observed / trend / recommendation
    confidence: str
