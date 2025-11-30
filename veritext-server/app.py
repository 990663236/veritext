from typing import Optional
from datetime import datetime, timezone
import json
import re  

from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError

from db import get_db, Base, engine
from models import User, Analysis
from schemas import (
    RegisterReq,
    LoginReq,
    TokenRes,
    UserRes,
    AnalyzeReq,
    AnalyzeRes,
    HistoryItem,
)
from security import hash_password, verify_password, new_token


app = FastAPI(title="Veritext API", version="0.1.0")


@app.on_event("startup")
def on_startup() -> None:
  Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_token(auth: Optional[str]) -> str:
    if not auth:
        return ""
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() in ("bearer", "token"):
        return parts[1]
    return auth


# =========================
#        AUTH
# =========================

@app.post(
    "/auth/register",
    response_model=UserRes,
    status_code=status.HTTP_201_CREATED,
    tags=["auth"],
)
def register(payload: RegisterReq, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    pwd = payload.password.strip()

    if len(pwd) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 6 caracteres",
        )

    try:
        exists = db.query(User).filter(User.email == email).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado",
            )

        user = User(email=email, password_hash=hash_password(pwd), token=None)
        db.add(user)
        db.commit()
        db.refresh(user)

        return UserRes(id=user.id, email=user.email)

    except HTTPException as he:
        db.rollback()
        raise he

    except IntegrityError as ie:
        db.rollback()
        msg = str(ie.orig).lower()
        print("[IntegrityError]", ie.orig)
        if "1062" in msg or "duplicate entry" in msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Datos inválidos",
        )

    except OperationalError as oe:
        db.rollback()
        print("[OperationalError]", oe.orig)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de base de datos",
        )

    except Exception as e:
        db.rollback()
        print("[Register Exception]", repr(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al registrar",
        )


@app.post("/auth/login", response_model=TokenRes, tags=["auth"])
def login(payload: LoginReq, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    tok = new_token()
    user.token = tok
    db.commit()

    return TokenRes(token=tok)


@app.get("/auth/verify", tags=["auth"])
def verify(Authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    token = _extract_token(Authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta token",
        )

    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    return {"ok": True, "email": user.email, "id": user.id}


# =========================
#     HEALTH CHECK
# =========================

@app.get("/")
def health():
    return {"ok": True, "service": "Veritext API"}


# =========================
#     MODELO ENTRENADO
# =========================

MODEL = None  # se carga la primera vez que se use

def _lazy_load_model():
    """Carga el modelo TF-IDF + Regresión Logística desde model.joblib."""
    global MODEL
    if MODEL is None:
        from joblib import load  # type: ignore
        try:
            MODEL = load("model.joblib")
            print("[analyze] Modelo cargado:", type(MODEL))
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se encontró model.joblib. Entrena el modelo primero.",
            )
        except Exception as e:
            print("[analyze] Error al cargar modelo:", repr(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo cargar el modelo entrenado.",
            )
    return MODEL

# -------- helper NUEVO para ver si hay texto suficiente --------
def _texto_suficiente(txt: str, min_words: int = 30) -> bool:
    # quitamos símbolos raros, dejamos letras/números/espacios
    cleaned = re.sub(r"[^\wÁÉÍÓÚáéíóúÑñ\s]", " ", txt, flags=re.UNICODE)
    words = [w for w in cleaned.split() if w]
    return len(words) >= min_words

# =========================
#        ANÁLISIS
# =========================

@app.post("/analyze/text", response_model=AnalyzeRes, tags=["analyze"])
def analyze_text(
    body: AnalyzeReq,
    Authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> AnalyzeRes:
    txt = (body.text or "").strip()
    if not txt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El texto no puede estar vacío",
        )

    # 👇 NUEVO: solo aplicar el filtro fuerte a textos MUY largos (típico PDF)
    # Si el texto es corto/mediano (lo que escribes en la app), se analiza normal.
    if len(txt) > 2000 and not _texto_suficiente(txt, min_words=30):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "El archivo parece contener solo imágenes o muy poco texto legible. "
                "No es posible analizarlo."
            ),
        )


    # Usuario (si viene token)
    token = _extract_token(Authorization)
    user: Optional[User] = None
    if token:
        user = db.query(User).filter(User.token == token).first()

    model = _lazy_load_model()
    try:
        proba = model.predict_proba([txt])[0][1]  # prob de IA (clase 1)
        prob = float(proba)
    except Exception as e:
        print("[analyze] Error al predecir:", repr(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al ejecutar el modelo",
        )

    top_words = sorted(set(w.lower() for w in txt.split()))[:5]

    analysis = Analysis(
        user_id=user.id if user else None,
        text=txt,
        score=prob,
        top_words=json.dumps(top_words),
        created_at=datetime.now(timezone.utc),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return AnalyzeRes(
        score=prob,
        buckets={"human": 1 - prob, "ai": prob},
        top_words=top_words,
    )
# =========================
#        HISTORIAL
# =========================
from typing import Optional
import json
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from db import get_db
from models import Analysis, User
from schemas import HistoryItem

def _extract_token(auth: Optional[str]) -> str:
    if not auth:
        return ""
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() in ("bearer", "token"):
        return parts[1]
    return auth

@app.get("/history", tags=["analyze"], response_model=list[HistoryItem])
def get_history(
    Authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    token = _extract_token(Authorization)
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Falta token",
        )

    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Token inválido",
        )

    rows = (
        db.query(Analysis)
        .filter(Analysis.user_id == user.id)
        .order_by(Analysis.created_at.desc())
        .limit(200)
        .all()
    )

    items: list[HistoryItem] = []
    for r in rows:
        try:
            tw = json.loads(r.top_words) if r.top_words else []
        except Exception:
            tw = []

        items.append(
            HistoryItem(
                id=r.id,
                score=r.score,
                top_words=tw,
                created_at=r.created_at,
            )
        )

    return items
