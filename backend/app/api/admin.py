from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_admin
from app.core.security import get_password_hash
from app.models.user import Role, User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", dependencies=[Depends(require_admin)])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).limit(100))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "mobile_number": u.mobile_number,
            "email": u.email,
            "is_active": u.is_active,
            "role_id": u.role_id,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.post("/officials", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_official(
    email: str,
    password: str,
    full_name: str,
    designation: str,
    department: str,
    role_name: str = "official",
    db: AsyncSession = Depends(get_db),
):
    from app.models.official import GovernmentOfficial

    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    role_result = await db.execute(select(Role).where(Role.name == role_name))
    role = role_result.scalar_one_or_none()
    if role is None:
        role = Role(name=role_name, permissions=[])
        db.add(role)
        await db.flush()

    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    official = GovernmentOfficial(
        user_id=user.id,
        full_name=full_name,
        designation=designation,
        department=department,
    )
    db.add(official)
    await db.commit()
    return {"message": "Official created", "user_id": str(user.id)}


@router.patch("/users/{user_id}/toggle-active", dependencies=[Depends(require_admin)])
async def toggle_user_active(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"user_id": user_id, "is_active": user.is_active}


@router.get("/roles", dependencies=[Depends(require_admin)])
async def list_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Role))
    roles = result.scalars().all()
    return [{"id": r.id, "name": r.name, "permissions": r.permissions} for r in roles]
