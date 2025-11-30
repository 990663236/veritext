from datasets import load_dataset

print("Descargando IA dataset...")
ds_ai = load_dataset("fka/awesome-chatgpt-prompts")
ds_ai["train"].to_csv("data/awesome_prompts.csv", index=False)

print("Dataset guardado en data/awesome_prompts.csv")
