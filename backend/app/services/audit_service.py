from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        resource_type: str,
        resource_id: str | None = None,
        details: dict | None = None,
        user_id: str | None = None,
        user_email: str | None = None,
        ip_address: str | None = None
    ) -> AuditEvent:
        event = AuditEvent(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            user_id=user_id,
            user_email=user_email,
            ip_address=ip_address
        )
        db.add(event)
        try:
            db.commit()
            db.refresh(event)
        except Exception:
            db.rollback()
        return event
