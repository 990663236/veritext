# db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

# Carga el .env desde la carpeta del backend
load_dotenv()  # si algún día cambias el cwd, ver nota abajo

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no definido")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # evita 'MySQL server has gone away'
    pool_recycle=3600,    # recicla conexiones cada 1h
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
