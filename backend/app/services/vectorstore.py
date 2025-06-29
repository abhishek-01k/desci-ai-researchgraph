import faiss
import numpy as np

def find_similar(claim_embedding, abstract_embeddings, abstracts, k=5):
    dim = len(claim_embedding)
    index = faiss.IndexFlatL2(dim)  # L2 (Euclidean) similarity index
    index.add(np.array(abstract_embeddings))  # Add abstract vectors
    D, I = index.search(np.array([claim_embedding]), k)  # Search top-k
    return [abstracts[i] for i in I[0]]
