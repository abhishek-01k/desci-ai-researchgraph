import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentence_transformers import SentenceTransformer
from app.services.vectorstore import find_similar

model = SentenceTransformer("all-MiniLM-L6-v2")

abstracts = [
    "NAD+ extends lifespan in mice.",
    "No evidence that vitamin C affects longevity.",
    "Caloric restriction improves aging markers.",
    "This study finds no impact of NAD+ on rats.",
    "Exercise is known to extend lifespan."
]

# Embed abstracts and claim
abstract_vectors = model.encode(abstracts)
claim = "NAD+ improves lifespan"
claim_vector = model.encode(claim)

top_matches = find_similar(claim_vector, abstract_vectors, abstracts, k=3)
print("Top matches:\n", top_matches)
