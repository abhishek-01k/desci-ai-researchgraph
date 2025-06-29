from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # You can change this model later

def embed_text(text):
    return model.encode(text)

def embed_texts(texts):
    return model.encode(texts)


# "all-MiniLM-L6-v2" is fast and accurate for semantic search.
# Alternatives: "paraphrase-MiniLM-L3-v2", "allenai-specter" (great for scientific papers)

# You can switch to a domain-specific model later (e.g., BioBERT or SciBERT) for better biomedical accuracy.
