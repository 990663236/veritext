from typing import List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib, os, re

MODEL_PATH = "model.joblib"

human_texts = [
    "Hoy fui a la universidad y conversé con mis compañeros sobre el proyecto.",
    "El ensayo presenta argumentos personales y ejemplos reales de la vida diaria.",
    "Escribí este texto basándome en mi experiencia trabajando en equipo.",
    "La reunión de ayer fue complicada, pero logramos coordinar las tareas.",
    "Mi opinión es que la educación debe priorizar el pensamiento crítico.",
    "El profesor pidió que expliquemos con nuestras palabras lo aprendido.",
]
ai_texts = [
    "Este texto ofrece una perspectiva integral y coherente fundamentada en evidencia.",
    "A continuación, se presenta un análisis detallado que considera múltiples dimensiones.",
    "El presente documento sintetiza hallazgos relevantes de fuentes secundarias confiables.",
    "La presente redacción optimiza la claridad expositiva mediante estructuras formales.",
    "Se proporciona un abordaje sistemático con terminología neutral y consistencia estilística.",
    "El informe integra definiciones, categorizaciones y una visión holística del fenómeno.",
]

def normalize_text(t: str) -> str:
    t = t.lower()
    t = re.sub(r"\s+", " ", t)
    return t.strip()

def build_or_load_model() -> Pipeline:
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    X = [normalize_text(t) for t in human_texts + ai_texts]
    y = [0]*len(human_texts) + [1]*len(ai_texts)
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), min_df=1, max_features=5000)),
        ("clf", LogisticRegression(max_iter=1000))
    ])
    pipe.fit(X, y)
    joblib.dump(pipe, MODEL_PATH)
    return pipe

def get_top_influential_words(pipe: Pipeline, text: str, top_k: int = 8) -> List[str]:
    tfidf = pipe.named_steps["tfidf"]
    clf: LogisticRegression = pipe.named_steps["clf"]
    vocab = tfidf.get_feature_names_out()
    X_text = tfidf.transform([text])
    coefs = clf.coef_[0]
    scores = (X_text.toarray()[0]) * coefs
    idx_sorted = scores.argsort()[::-1]
    words = []
    for idx in idx_sorted:
        if X_text.toarray()[0][idx] > 0:
            words.append(vocab[idx])
        if len(words) >= top_k:
            break
    return words

def score_text(pipe: Pipeline, text: str) -> Tuple[float, List[str]]:
    t = normalize_text(text)
    prob = pipe.predict_proba([t])[0][1]
    top_words = get_top_influential_words(pipe, t, top_k=8)
    return float(prob), top_words
