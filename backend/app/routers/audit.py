from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditEvent
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/audit", tags=["Audit Log"])

@router.get("")
def list_audit_events(
    resource_type: str | None = None,
    action: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    query = db.query(AuditEvent)
    if resource_type:
        query = query.filter(AuditEvent.resource_type == resource_type)
    if action:
        query = query.filter(AuditEvent.action == action)

    events = query.order_by(AuditEvent.created_at.desc()).limit(limit).all()
    return events
