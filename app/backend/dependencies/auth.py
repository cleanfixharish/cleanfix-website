import hashlib
import logging
from datetime import datetime
from dataclasses import dataclass
from typing import Literal, Optional

from core.auth import AccessTokenError, decode_access_token
from core.database import get_db
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from models.viewer_access import ViewerAccess
from models.account_profile import AccountProfile
from models.business_relationship import BusinessRelationship
from core.config import settings
from schemas.auth import UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)

BusinessRelationshipType = Literal["managed_provider", "referral_partner"]


@dataclass(frozen=True)
class BusinessPortalPrincipal:
    user: UserResponse
    relationship_id: int
    relationship_type: BusinessRelationshipType


async def _get_business_portal_principal(
    relationship_type: BusinessRelationshipType,
    current_user: UserResponse,
    db: AsyncSession,
) -> BusinessPortalPrincipal:
    """Authorize one exact, active business relationship.

    Account type and JWT role are deliberately insufficient. This prevents a
    customer, pending applicant, revoked business, or the other business portal
    role from crossing the boundary.
    """
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An approved business relationship is required",
        )

    profile_result = await db.execute(
        select(AccountProfile).where(AccountProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None or profile.account_type != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A business account is required",
        )

    relationship_result = await db.execute(
        select(BusinessRelationship).where(
            BusinessRelationship.user_id == current_user.id,
            BusinessRelationship.relationship_type == relationship_type,
            BusinessRelationship.status == "active",
        )
    )
    relationship = relationship_result.scalar_one_or_none()
    if relationship is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Active {relationship_type} approval is required",
        )

    return BusinessPortalPrincipal(
        user=current_user,
        relationship_id=relationship.id,
        relationship_type=relationship_type,
    )


async def get_bearer_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> str:
    """Extract bearer token from Authorization header."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    logger.debug("Authentication required for request %s %s", request.method, request.url.path)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")


async def get_current_user(token: str = Depends(get_bearer_token)) -> UserResponse:
    """Dependency to get current authenticated user via JWT token."""
    try:
        payload = decode_access_token(token)
    except AccessTokenError as exc:
        # Log error type only, not the full exception which may contain sensitive token data
        logger.warning("Token validation failed: %s", type(exc).__name__)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=exc.message)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    last_login_raw = payload.get("last_login")
    last_login = None
    if isinstance(last_login_raw, str):
        try:
            last_login = datetime.fromisoformat(last_login_raw)
        except ValueError:
            # Log user hash instead of actual user ID to avoid exposing sensitive information
            user_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:8] if user_id else "unknown"
            logger.debug("Failed to parse last_login for user hash: %s", user_hash)

    return UserResponse(
        id=user_id,
        email=payload.get("email", ""),
        name=payload.get("name"),
        role=payload.get("role", "user"),
        last_login=last_login,
    )


async def get_admin_user(
    current_user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """Dependency to ensure current user has admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    normalized_email = current_user.email.strip().lower()
    primary_admin = getattr(settings, "admin_user_email", "").strip().lower()
    if normalized_email != primary_admin:
        result = await db.execute(
            select(ViewerAccess).where(
                ViewerAccess.email == normalized_email,
                ViewerAccess.access_role == "admin",
                ViewerAccess.is_active.is_(True),
            )
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access has been removed")
    return current_user


async def get_dashboard_viewer(
    current_user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """Allow only accounts explicitly assigned the read-only viewer role."""
    if current_user.role != "viewer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Viewer access required")

    normalized_email = current_user.email.strip().lower()
    result = await db.execute(
        select(ViewerAccess).where(
            ViewerAccess.email == normalized_email,
            ViewerAccess.access_role == "viewer",
            ViewerAccess.is_active.is_(True),
        )
    )

    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Viewer access has been removed")
    return current_user


async def get_managed_provider(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BusinessPortalPrincipal:
    return await _get_business_portal_principal("managed_provider", current_user, db)


async def get_referral_partner(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BusinessPortalPrincipal:
    return await _get_business_portal_principal("referral_partner", current_user, db)


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[UserResponse]:
    """Return the authenticated user when present, while allowing public reads."""
    if not credentials or credentials.scheme.lower() != "bearer":
        return None
    return await get_current_user(credentials.credentials)
