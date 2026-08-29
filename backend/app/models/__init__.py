# Import all models so Alembic can detect them for autogenerate
from app.models.user import Role, User, OTPSession  # noqa: F401
from app.models.worker import WorkerProfile, Skill, WorkerSkill, EmploymentRecord, WageRecord  # noqa: F401
from app.models.welfare import WelfareScheme, SchemeEligibilityRule, WorkerSchemeMatch  # noqa: F401
from app.models.wage import ReferenceWage  # noqa: F401
from app.models.grievance import Grievance, GrievanceUpdate  # noqa: F401
from app.models.official import GovernmentOfficial, Notification, AIInteraction, AuditLog  # noqa: F401
