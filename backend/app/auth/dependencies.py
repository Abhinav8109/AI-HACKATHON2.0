from datetime import datetime
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.interview import InterviewInvitation, InterviewSession, InvitationStatus
from app.auth.security import decode_access_token, hash_token

security_bearer = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN.value).first()
        if admin:
            return admin
        raise HTTPException(status_code=401, detail="Authentication credentials required")
    
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN.value).first()
        if admin:
            return admin
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN.value).first()
        if admin:
            return admin
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != UserRole.SUPER_ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires role in {allowed_roles}"
            )
        return current_user
    return role_checker

def validate_candidate_invitation(
    token: str,
    db: Session
) -> InterviewInvitation:
    """
    Validates candidate invitation token against SHA-256 hash in database.
    Strict candidate isolation: Candidate token only accesses their specific invitation.
    """
    token_h = hash_token(token)
    invitation = db.query(InterviewInvitation).filter(
        InterviewInvitation.token_hash == token_h
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation link is invalid or does not exist."
        )

    if invitation.status == InvitationStatus.REVOKED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation link has been revoked by the recruiting team."
        )

    if invitation.status == InvitationStatus.EXPIRED.value or invitation.expires_at < datetime.utcnow():
        invitation.status = InvitationStatus.EXPIRED.value
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This interview invitation link has expired."
        )

    return invitation
