# veritext-server/train_model.py
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from joblib import dump

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "data" / "textos.csv"

print(f"📄 Cargando dataset desde: {CSV_PATH}")

# 1) Cargar dataset
df = pd.read_csv(CSV_PATH)
df = df.dropna(subset=["texto", "label"])

X = df["texto"].astype(str)
y = df["label"].astype(int)  # 0 = humano, 1 = IA

n_samples = len(df)
n_classes = df["label"].nunique()
print(f"🔎 Muestras: {n_samples} | Clases: {n_classes}")


pipe = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_df=0.9,
        min_df=1,
    )),
    ("clf", LogisticRegression(
        max_iter=200,
        n_jobs=-1,
        class_weight="balanced",
    )),
])


if n_samples >= 10 and n_classes >= 2:
    print("🚀 Entrenando con train/test split (con stratify)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe.fit(X_train, y_train)

    # 4) Evaluar en test
    y_pred = pipe.predict(X_test)
    print("📊 Evaluación en conjunto de prueba:")
    print(classification_report(y_test, y_pred, digits=3))

else:
    # Dataset pequeño -> entrenamos con TODO sin split
    print("⚠️ Muy pocos datos para hacer split estratificado.")
    print("   Se entrenará el modelo usando TODO el dataset.")
    pipe.fit(X, y)


MODEL_PATH = BASE_DIR / "model.joblib"
dump(pipe, MODEL_PATH)
print(f"✅ Modelo guardado en {MODEL_PATH}")
