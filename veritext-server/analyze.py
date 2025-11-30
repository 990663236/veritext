from datetime import datetime, timezone
from typing import Optional

import json
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from models import User, Analysis
from schemas import AnalyzeReq, AnalyzeRes

router = APIRouter(prefix="/analyze", tags=["analyze"])

MODEL = None 


def _extract_token(auth: Optional[str]) -> str:
    if not auth:
        return ""
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() in ("bearer", "token"):
        return parts[1]
    return auth


def _lazy_load_model():
    """Carga el modelo sólo una vez si existe model.joblib."""
    global MODEL
    if MODEL is None:
        try:
            from joblib import load  # type: ignore

            MODEL = load("model.joblib")
            print("[analyze] Modelo cargado: model.joblib")
        except Exception as e:
            MODEL = False
            print("[analyze] No se pudo cargar model.joblib, usando dummy:", repr(e))
    return MODEL


@router.post("/text", response_model=AnalyzeRes)
def analyze_text(
    body: AnalyzeReq,
    db: Session = Depends(get_db),
    Authorization: Optional[str] = Header(None),
) -> AnalyzeRes:
    txt = (body.text or "").strip()
    if not txt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El texto no puede estar vacío",
        )


    token = _extract_token(Authorization)
    user: Optional[User] = None
    if token:
        user = db.query(User).filter(User.token == token).first()


    model = _lazy_load_model()
    if model:
        # TODO: aquí va tu lógica real con el modelo

        prob = min(len(txt) / 1000.0, 1.0)
    else:
        prob = min(len(txt) / 1000.0, 1.0)

    top_words = sorted(set(w.lower() for w in txt.split()))[:5]

    # --- guardar en BD ---
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
