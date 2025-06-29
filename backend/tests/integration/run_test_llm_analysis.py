import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


from app.services.llm_analysis import analyze_claim_support

claim = "NAD+ supplementation increases lifespan in mammals"
abstracts = [
    {
        "title": "NAD+ Improves Longevity in Mice",
        "abstract": "This study shows that NAD+ supplementation extends lifespan in mice by improving mitochondrial function."
    },
    {
        "title": "No Effect of NAD+ on Aging in Rats",
        "abstract": "Contrary to earlier studies, we found that NAD+ had no statistically significant impact on lifespan in older rats."
    }
]

result = analyze_claim_support(claim, abstracts)
print("🔬 LLM Verdict:\n", result)