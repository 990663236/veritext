from datetime import datetime
from pydantic import BaseModel, EmailStr


# ========= AUTH =========

class RegisterReq(BaseModel):
    email: EmailStr
    password: str


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class TokenRes(BaseModel):
    token: str


class UserRes(BaseModel):
    id: int
    email: EmailStr


class AnalyzeReq(BaseModel):
    text: str


class AnalyzeRes(BaseModel):
    score: float
    buckets: dict[str, float]
    top_words: list[str]


class HistoryItem(BaseModel):
    id: int
    score: float
    top_words: list[str]
    created_at: datetime

    class Config:

        from_attributes = True

