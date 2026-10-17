import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    RECRUITER_ADMIN = "RECRUITER_ADMIN"
    REVIEWER = "REVIEWER"
    CANDIDATE = "CANDIDATE"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="organization")
    campaigns = relationship("HiringCampaign", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.RECRUITER_ADMIN.value, nullable=False)
    is_active = Column(Boolean, default=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="users")
