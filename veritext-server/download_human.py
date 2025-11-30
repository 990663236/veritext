from datasets import load_dataset

print("Descargando texto humano (arxiv)...")
ds = load_dataset("nick007x/arxiv-papers")
ds["train"].to_csv("data/human_arxiv.csv", index=False)

print("Guardado en data/human_arxiv.csv")
