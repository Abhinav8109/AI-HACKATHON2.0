from pydantic import BaseModel, EmailStr
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None = None

    class Config:
        from_attributes = True

class BootstrapAdminRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str = "Enterprise Talent Solutions"
