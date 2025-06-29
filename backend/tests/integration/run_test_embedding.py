import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.embedding import embed_text, embed_texts

single = embed_text("NAD+ improves lifespan in mammals")
print("Single vector shape:", single.shape)

batch = embed_texts([
    "NAD+ improves lifespan in mammals.",
    "This study showed no significant effect.",
    "Resveratrol has anti-aging effects."
])
print("Batch vector shape:", batch.shape)
