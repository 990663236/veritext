# build_dataset.py
import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parent
DATA_DIR = BASE / "data"

AI_CSV = DATA_DIR / "awesome_prompts.csv"
HUMAN_CSV = DATA_DIR / "human_arxiv.csv"
OUT_CSV = DATA_DIR / "textos.csv"

# === CONFIGURACIÓN ===
# número máximo de ejemplos de cada clase
N_AI = 5000      # puedes subirlo si tu PC aguanta más
N_HUMAN = 5000   # idem

def main():
    # ----------------- TEXTOS IA (ChatGPT prompts) -----------------
    print("📂 Leyendo IA desde:", AI_CSV)
    df_ai = pd.read_csv(AI_CSV)

    if "prompt" not in df_ai.columns:
        raise SystemExit(f"No se encontró la columna 'prompt' en {AI_CSV}")

    # dejamos solo la columna de texto y renombramos a 'texto'
    df_ai = df_ai.rename(columns={"prompt": "texto"})
    df_ai["label"] = 1   # 1 = IA

    if len(df_ai) > N_AI:
        df_ai = df_ai.sample(N_AI, random_state=42)

    df_ai = df_ai[["texto", "label"]]
    print("✅ Ejemplos IA:", len(df_ai))

    # ----------------- TEXTOS HUMANOS (arXiv) -----------------
    print("📂 Leyendo HUMANO desde:", HUMAN_CSV)

    # sólo cargamos title y abstract, y limitado a N_HUMAN filas
    df_h = pd.read_csv(
        HUMAN_CSV,
        usecols=["title", "abstract"],
        nrows=N_HUMAN,
    )

    # rellenamos nulos con cadena vacía
    df_h["title"] = df_h["title"].fillna("")
    df_h["abstract"] = df_h["abstract"].fillna("")

    # combinamos título + abstract en una sola columna de texto
    df_h["texto"] = (df_h["title"] + ". " + df_h["abstract"]).str.strip()
    df_h = df_h.drop(columns=["title", "abstract"])

    # eliminamos filas sin texto
    df_h = df_h[df_h["texto"].str.len() > 0]

    df_h["label"] = 0   # 0 = humano
    df_h = df_h[["texto", "label"]]

    print("✅ Ejemplos humanos:", len(df_h))

    # ----------------- COMBINAR Y GUARDAR -----------------
    df_all = pd.concat([df_ai, df_h], ignore_index=True)
    df_all = df_all.sample(frac=1.0, random_state=42).reset_index(drop=True)

    print("📊 Dataset final:", df_all.shape)
    print(df_all["label"].value_counts())

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df_all.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print("💾 Guardado en:", OUT_CSV)


if __name__ == "__main__":
    main()
