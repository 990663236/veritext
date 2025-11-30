from datetime import datetime

from sqlalchemy import BigInteger, String, func, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.mysql import DATETIME

from db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True
    )
    email: Mapped[str] = mapped_column(
        String(191), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)


    token: Mapped[str | None] = mapped_column(String(128), nullable=True)


    created_at: Mapped[datetime] = mapped_column(
        DATETIME(fsp=6), server_default=func.now(), nullable=False
    )

    analyses = relationship("Analysis", back_populates="user")


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True
    )
    user_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    text: Mapped[str] = mapped_column(Text, nullable=False)


    score: Mapped[float] = mapped_column(Float, nullable=False)


    top_words: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DATETIME(fsp=6), server_default=func.now(), nullable=False
    )

    user = relationship("User", back_populates="analyses")
