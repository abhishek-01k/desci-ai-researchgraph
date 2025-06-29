import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.text_normalize_service import normalize_text

print("\nTest 1:")
print(normalize_text(" NAD+ improves lifespan!?? "))

print("\nTest 2:")
print(normalize_text("The effectiveness of fasting is significant.", remove_stopwords=True))

print("\nTest 3:")
print(normalize_text(" α-Synuclein aggregation leads to toxicity "))
