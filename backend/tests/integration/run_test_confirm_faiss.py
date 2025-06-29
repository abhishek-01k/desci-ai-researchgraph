import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
import faiss

vec = np.random.rand(10, 384).astype("float32")
index = faiss.IndexFlatL2(384)
index.add(vec)
D, I = index.search(vec[:1], 5)
print(I)