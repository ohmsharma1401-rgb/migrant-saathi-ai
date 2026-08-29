"""
Seed script for Migrant Saathi AI demo data.

Run with:
    python -m app.database.seed
    (from the backend/ directory)

or via Docker:
    docker-compose exec backend python -m app.database.seed

The script is idempotent — safe to run multiple times.
"""

import sys
from datetime import date

from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.database.base import Base
from app.models.user import User, Role
from app.models.worker import WorkerProfile, Skill, EmploymentRecord, WorkerSkill
from app.models.welfare import WelfareScheme
from app.models.wage import ReferenceWage
from app.models.official import GovernmentOfficial

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def get_or_create(session: Session, model, defaults: dict | None = None, **lookup):
    """
    Fetch an existing row by *lookup* kwargs, or create it with *lookup* + *defaults*.
    Returns (instance, created: bool).
    """
    instance = session.query(model).filter_by(**lookup).first()
    if instance:
        return instance, False
    params = {**lookup, **(defaults or {})}
    instance = model(**params)
    session.add(instance)
    session.flush()
    return instance, True


# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------

def seed_roles(session: Session) -> dict[str, Role]:
    print("\n[1/8] Seeding roles...")
    role_names = ["worker", "official", "inspector", "admin"]
    roles: dict[str, Role] = {}
    for name in role_names:
        role, created = get_or_create(session, Role, name=name)
        roles[name] = role
        status = "created" if created else "exists"
        print(f"      Role '{name}': {status}")
    return roles


def seed_users(session: Session, roles: dict[str, Role]) -> dict[str, User]:
    print("\n[2/8] Seeding demo users...")
    users: dict[str, User] = {}

    # --- Worker (mobile-based login) ---
    worker_user, created = get_or_create(
        session,
        User,
        defaults={
            "mobile_number": "9876543210",
            "role_id": roles["worker"].id,
            "is_active": True,
        },
        mobile_number="9876543210",
    )
    users["worker"] = worker_user
    print(f"      Worker user (mobile=9876543210): {'created' if created else 'exists'}")

    # --- Government Official ---
    official_user, created = get_or_create(
        session,
        User,
        defaults={
            "email": "official@gujarat.gov.in",
            "hashed_password": hash_password("Demo@1234"),
            "role_id": roles["official"].id,
            "is_active": True,
        },
        email="official@gujarat.gov.in",
    )
    users["official"] = official_user
    print(f"      Official user (official@gujarat.gov.in): {'created' if created else 'exists'}")

    # --- Labour Inspector ---
    inspector_user, created = get_or_create(
        session,
        User,
        defaults={
            "email": "inspector@gujarat.gov.in",
            "hashed_password": hash_password("Demo@1234"),
            "role_id": roles["inspector"].id,
            "is_active": True,
        },
        email="inspector@gujarat.gov.in",
    )
    users["inspector"] = inspector_user
    print(f"      Inspector user (inspector@gujarat.gov.in): {'created' if created else 'exists'}")

    # --- Admin ---
    admin_user, created = get_or_create(
        session,
        User,
        defaults={
            "email": "admin@saathi.ai",
            "hashed_password": hash_password("Admin@1234"),
            "role_id": roles["admin"].id,
            "is_active": True,
        },
        email="admin@saathi.ai",
    )
    users["admin"] = admin_user
    print(f"      Admin user (admin@saathi.ai): {'created' if created else 'exists'}")

    return users


def seed_worker_profile(session: Session, worker_user: User) -> WorkerProfile:
    print("\n[3/8] Seeding demo worker profile...")
    profile, created = get_or_create(
        session,
        WorkerProfile,
        defaults={
            "full_name": "Ramesh Kumar",
            "origin_state": "Bihar",
            "current_district": "Ahmedabad",
            "current_city": "Ahmedabad",
            "dob": date(1990, 5, 15),
            "gender": "male",
            "aadhaar_last4": "7890",
            "profile_complete": True,
        },
        user_id=worker_user.id,
    )
    print(f"      Worker profile for Ramesh Kumar: {'created' if created else 'exists'}")

    # Seed employment record
    get_or_create(
        session,
        EmploymentRecord,
        defaults={
            "employer_name": "Shree Construction Ltd.",
            "sector": "Construction",
            "occupation": "Mason",
            "is_current": True,
        },
        worker_id=profile.id,
        occupation="Mason",
    )
    return profile


def seed_skills(session: Session) -> list[Skill]:
    print("\n[4/8] Seeding skills...")

    skills_data = [
        # Construction
        {"name": "Mason",             "sector": "Construction",   "category": "Skilled Trade"},
        {"name": "Carpenter",         "sector": "Construction",   "category": "Skilled Trade"},
        {"name": "Electrician",       "sector": "Construction",   "category": "Skilled Trade"},
        {"name": "Plumber",           "sector": "Construction",   "category": "Skilled Trade"},
        {"name": "Welder",            "sector": "Construction",   "category": "Skilled Trade"},
        # Textiles
        {"name": "Weaver",            "sector": "Textiles",       "category": "Skilled Trade"},
        {"name": "Tailor",            "sector": "Textiles",       "category": "Skilled Trade"},
        {"name": "Embroidery Worker", "sector": "Textiles",       "category": "Skilled Trade"},
        # Diamond
        {"name": "Diamond Polisher",  "sector": "Diamond",        "category": "Skilled Trade"},
        {"name": "Diamond Sorter",    "sector": "Diamond",        "category": "Skilled Trade"},
        # Manufacturing
        {"name": "Machine Operator",  "sector": "Manufacturing",  "category": "Semi-Skilled"},
        {"name": "Fitter",            "sector": "Manufacturing",  "category": "Skilled Trade"},
    ]

    skills: list[Skill] = []
    for s in skills_data:
        skill, created = get_or_create(
            session,
            Skill,
            defaults={"sector": s["sector"], "category": s["category"]},
            name=s["name"],
        )
        skills.append(skill)
        print(f"      Skill '{s['name']}' ({s['sector']}): {'created' if created else 'exists'}")

    return skills


def seed_welfare_schemes(session: Session) -> list[WelfareScheme]:
    print("\n[5/8] Seeding welfare schemes (DEMO DATA)...")

    schemes_data = [
        {
            "scheme_code": "GJ-CWWF-001",
            "name": "Construction Workers Welfare Fund",
            "description": (
                "[DEMO DATA] Gujarat Building and Other Construction Workers Welfare Fund "
                "provides financial assistance and welfare benefits to registered construction "
                "workers in Gujarat. Benefits include housing assistance, education grants for "
                "children, medical aid, and maternity benefits. "
                "VERIFY WITH OFFICIAL SOURCES BEFORE RELIANCE."
            ),
            "applicable_states": ["Gujarat"],
            "target_sectors": ["Construction"],
            "target_occupations": [
                "Mason", "Carpenter", "Electrician", "Plumber", "Welder",
                "Painter", "Scaffolder", "Tile Layer",
            ],
            "min_age": 18,
            "max_age": 60,
            "benefits_summary": (
                "Housing assistance up to ₹1,50,000 | Education grant ₹5,000–₹20,000/year | "
                "Medical aid up to ₹50,000 | Maternity benefit ₹10,000 | Pension after 60"
            ),
            "required_documents": [
                "Aadhaar Card",
                "Registration Certificate (BOCW Board)",
                "Proof of employment in construction (90 days)",
                "Bank account details",
                "Passport-size photograph",
            ],
            "official_source": "DEMO DATA - Verify with Gujarat BOCW Welfare Board (bocwwb.gujarat.gov.in)",
            "is_active": True,
        },
        {
            "scheme_code": "CENTRAL-PMSYM-001",
            "name": "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
            "description": (
                "[DEMO DATA] PM-SYM is a central government voluntary and contributory pension "
                "scheme for unorganised workers with monthly income up to ₹15,000. Workers "
                "aged 18–40 can enrol and receive ₹3,000/month pension after age 60. "
                "VERIFY WITH OFFICIAL SOURCES BEFORE RELIANCE."
            ),
            "applicable_states": ["All States", "Gujarat", "Bihar"],
            "target_sectors": [
                "Construction", "Textiles", "Diamond", "Manufacturing",
                "Agriculture", "Domestic Work", "Street Vendor",
            ],
            "target_occupations": ["All informal workers with income ≤ ₹15,000/month"],
            "min_age": 18,
            "max_age": 40,
            "benefits_summary": (
                "₹3,000/month pension after age 60 | Equal contribution by Government | "
                "Family pension for spouse | Disability pension if permanently disabled before 60"
            ),
            "required_documents": [
                "Aadhaar Card",
                "Savings bank account / Jan-Dhan account",
                "Mobile number linked to Aadhaar",
            ],
            "official_source": "DEMO DATA - Verify at maandhan.in or nearest CSC centre",
            "is_active": True,
        },
        {
            "scheme_code": "CENTRAL-AABY-001",
            "name": "Aam Aadmi Bima Yojana (AABY)",
            "description": (
                "[DEMO DATA] AABY is a central government social security scheme providing "
                "life and disability insurance cover to below-poverty-line (BPL) and "
                "marginally above-BPL rural landless households. The scheme is administered "
                "by LIC of India. VERIFY WITH OFFICIAL SOURCES BEFORE RELIANCE."
            ),
            "applicable_states": ["All States", "Gujarat", "Bihar"],
            "target_sectors": [
                "Construction", "Textiles", "Agriculture", "Fishing",
                "Handloom", "Leather", "Plantation",
            ],
            "target_occupations": ["Landless rural workers", "BPL household heads aged 18–59"],
            "min_age": 18,
            "max_age": 59,
            "benefits_summary": (
                "₹30,000 on natural death | ₹75,000 on accidental death / total disability | "
                "₹37,500 on partial disability | Scholarship ₹100/month for 2 children (Class 9–12)"
            ),
            "required_documents": [
                "Aadhaar Card",
                "BPL / APL ration card",
                "Age proof",
                "Nomination details",
                "Bank account details",
            ],
            "official_source": "DEMO DATA - Verify with LIC of India or state nodal agency",
            "is_active": True,
        },
        {
            "scheme_code": "GJ-BCWHI-001",
            "name": "Building and Construction Workers Health Insurance",
            "description": (
                "[DEMO DATA] Health insurance coverage for registered building and construction "
                "workers in Gujarat under the BOCW Act, 1996. Provides cashless hospitalisation "
                "and reimbursement for major medical expenses. "
                "VERIFY WITH OFFICIAL SOURCES BEFORE RELIANCE."
            ),
            "applicable_states": ["Gujarat"],
            "target_sectors": ["Construction"],
            "target_occupations": [
                "Mason", "Carpenter", "Electrician", "Plumber", "Welder",
                "Painter", "Helper", "Scaffolder",
            ],
            "min_age": 18,
            "max_age": 60,
            "benefits_summary": (
                "Cashless hospitalisation up to ₹2,00,000/year | "
                "OPD benefits | Maternity coverage ₹25,000 | "
                "Coverage for spouse and up to 2 dependent children"
            ),
            "required_documents": [
                "BOCW Registration Card",
                "Aadhaar Card",
                "90-day employment proof in construction",
                "Family details (spouse + children)",
                "Bank account details",
            ],
            "official_source": "DEMO DATA - Verify with Gujarat BOCW Welfare Board",
            "is_active": True,
        },
        {
            "scheme_code": "CENTRAL-NFSA-001",
            "name": "National Food Security Act (NFSA) Benefits",
            "description": (
                "[DEMO DATA] The NFSA 2013 entitles priority households to subsidised foodgrains "
                "through the Public Distribution System (PDS). Migrant workers may be eligible "
                "under the One Nation One Ration Card (ONORC) portability scheme, allowing them "
                "to access ration from any FPS in India. VERIFY WITH OFFICIAL SOURCES BEFORE RELIANCE."
            ),
            "applicable_states": ["All States", "Gujarat", "Bihar"],
            "target_sectors": [
                "Construction", "Textiles", "Diamond", "Manufacturing",
                "Agriculture", "Domestic Work",
            ],
            "target_occupations": ["All priority household members"],
            "min_age": 0,
            "max_age": 99,
            "benefits_summary": (
                "5 kg foodgrains/month/person at ₹1–3/kg (rice/wheat/coarse grains) | "
                "Portable across India via ONORC | "
                "Antyodaya Anna Yojana: 35 kg/household/month for poorest families"
            ),
            "required_documents": [
                "Ration Card (or ONORC-linked Aadhaar)",
                "Aadhaar Card",
                "Mobile number for OTP-based biometric authentication at FPS",
            ],
            "official_source": "DEMO DATA - Verify with state food & civil supplies department or dfpd.gov.in",
            "is_active": True,
        },
    ]

    schemes: list[WelfareScheme] = []
    for s in schemes_data:
        scheme, created = get_or_create(
            session,
            WelfareScheme,
            defaults={k: v for k, v in s.items() if k != "scheme_code"},
            scheme_code=s["scheme_code"],
        )
        schemes.append(scheme)
        print(f"      Scheme '{s['name']}': {'created' if created else 'exists'}")

    return schemes


def seed_reference_wages(session: Session) -> list[ReferenceWage]:
    print("\n[6/8] Seeding reference wages (DEMO DATA)...")

    demo_source = "DEMO DATA - For demonstration only. Verify with Gujarat Labour Department."

    wages_data = [
        {
            "state": "Gujarat",
            "district": "Ahmedabad",
            "sector": "Construction",
            "occupation": "Mason",
            "skill_level": "skilled",
            "min_daily_wage": 400,
            "reference_daily_wage": 500,
            "effective_date": date(2024, 4, 1),
            "source": demo_source,
        },
        {
            "state": "Gujarat",
            "district": "Ahmedabad",
            "sector": "Construction",
            "occupation": "Carpenter",
            "skill_level": "skilled",
            "min_daily_wage": 450,
            "reference_daily_wage": 550,
            "effective_date": date(2024, 4, 1),
            "source": demo_source,
        },
        {
            "state": "Gujarat",
            "district": "Surat",
            "sector": "Textiles",
            "occupation": "Weaver",
            "skill_level": "semi_skilled",
            "min_daily_wage": 380,
            "reference_daily_wage": 460,
            "effective_date": date(2024, 4, 1),
            "source": demo_source,
        },
        {
            "state": "Gujarat",
            "district": "Surat",
            "sector": "Diamond",
            "occupation": "Diamond Polisher",
            "skill_level": "skilled",
            "min_daily_wage": 500,
            "reference_daily_wage": 700,
            "effective_date": date(2024, 4, 1),
            "source": demo_source,
        },
        {
            "state": "Gujarat",
            "district": "Vadodara",
            "sector": "Manufacturing",
            "occupation": "Machine Operator",
            "skill_level": "semi_skilled",
            "min_daily_wage": 400,
            "reference_daily_wage": 500,
            "effective_date": date(2024, 4, 1),
            "source": demo_source,
        },
    ]

    wages: list[ReferenceWage] = []
    for w in wages_data:
        wage, created = get_or_create(
            session,
            ReferenceWage,
            defaults={k: v for k, v in w.items() if k not in ("state", "district", "sector", "occupation", "skill_level")},
            state=w["state"],
            district=w["district"],
            sector=w["sector"],
            occupation=w["occupation"],
            skill_level=w["skill_level"],
        )
        wages.append(wage)
        print(
            f"      Wage [{w['sector']}/{w['occupation']}/{w['district']}] "
            f"min=Rs.{w['min_daily_wage']} ref=Rs.{w['reference_daily_wage']}: "
            f"{'created' if created else 'exists'}"
        )

    return wages


def seed_official_profiles(
    session: Session,
    users: dict[str, User],
) -> None:
    print("\n[7/8] Seeding government official & inspector profiles...")

    # Official profile
    _, created = get_or_create(
        session,
        GovernmentOfficial,
        defaults={
            "full_name": "Priya Sharma",
            "designation": "Deputy Labour Commissioner",
            "department": "Gujarat Labour & Employment Department",
            "jurisdiction_district": "Ahmedabad",
            "employee_id": "GJ-LC-0042",
        },
        user_id=users["official"].id,
    )
    print(f"      Official profile (Priya Sharma): {'created' if created else 'exists'}")

    # Inspector profile
    _, created = get_or_create(
        session,
        GovernmentOfficial,
        defaults={
            "full_name": "Arjun Patel",
            "designation": "Labour Inspector",
            "department": "Gujarat Labour & Employment Department",
            "jurisdiction_district": "Ahmedabad",
            "employee_id": "GJ-LI-0087",
        },
        user_id=users["inspector"].id,
    )
    print(f"      Inspector profile (Arjun Patel): {'created' if created else 'exists'}")


def print_summary() -> None:
    print("\n[8/8] Seed complete.")
    print("\n" + "=" * 60)
    print("  DEMO CREDENTIALS")
    print("=" * 60)
    print("  Worker   mobile=9876543210  (OTP mocked to console)")
    print("  Official official@gujarat.gov.in  / Demo@1234")
    print("  Inspector inspector@gujarat.gov.in / Demo@1234")
    print("  Admin    admin@saathi.ai          / Admin@1234")
    print("=" * 60)
    print("\n  [NOTE] All welfare/wage data is DEMO DATA.")
    print("     Verify with official sources before production use.\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    print("Migrant Saathi AI — Database Seeder")
    print("=====================================")

    # Use sync URL; fall back gracefully if only async URL is configured
    db_url: str = getattr(settings, "SYNC_DATABASE_URL", None) or settings.DATABASE_URL
    if db_url.startswith("postgresql+asyncpg"):
        db_url = db_url.replace("postgresql+asyncpg", "postgresql", 1)

    engine = create_engine(db_url, echo=False)
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        try:
            roles = seed_roles(session)
            users = seed_users(session, roles)
            seed_worker_profile(session, users["worker"])
            seed_skills(session)
            seed_welfare_schemes(session)
            seed_reference_wages(session)
            seed_official_profiles(session, users)
            session.commit()
        except Exception as exc:
            session.rollback()
            print(f"\n[ERROR] Seed failed: {exc}", file=sys.stderr)
            raise

    print_summary()


if __name__ == "__main__":
    main()
