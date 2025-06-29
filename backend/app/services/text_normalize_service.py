import re
import nltk
from typing import Optional, Dict, Any, List
import uuid

# Download resources once
nltk.download("stopwords")
nltk.download("punkt")

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

import spacy

nlp = spacy.load("en_ner_bionlp13cg_md")

EN_STOPWORDS = set(stopwords.words("english"))
SCIENTIFIC_SYMBOLS = set("+-αβ")


def normalize_text(text: str, remove_stopwords: Optional[bool] = False) -> str:
    if not text:
        return ""

    text = text.strip()

    def clean_char(char):
        return char.isalnum() or char.isspace() or char in SCIENTIFIC_SYMBOLS

    cleaned = "".join(c if clean_char(c) else " " for c in text)
    cleaned = cleaned.lower()
    cleaned = re.sub(r"\s+", " ", cleaned)

    if remove_stopwords:
        cleaned = " ".join(word for word in cleaned.split() if word not in EN_STOPWORDS)

    return cleaned.strip()


def extract_biomedical_entities(text: str) -> Dict[str, List[str]]:
    doc = nlp(text)
    result: Dict[str, List[str]] = {}

    for ent in doc.ents:
        label = ent.label_.lower()
        print(f"Detected: {ent.text} → {label}")  # For debugging
        if label not in result:
            result[label] = []
        result[label].append(ent.text)

    return result


def prepare_claim_payload(claim: str) -> Dict[str, Any]:
    cleaned = normalize_text(claim, remove_stopwords=True)
    bio_entities = extract_biomedical_entities(claim)

    # Flatten and remove stopwords
    all_entities = [ent for group in bio_entities.values() for ent in group]
    filtered_entities = list(
        set(word for word in all_entities if word.lower() not in EN_STOPWORDS)
    )

    semantic_string = f"{normalize_text(claim.strip(), True)}. Key terms: {', '.join(filtered_entities)}"

    return {
        "clain_id": str(uuid.uuid4()),
        "claim": claim.strip(),
        "cleaned": cleaned,
        "Semantic_searchable": semantic_string,
        "entities": filtered_entities,
        "biomedical_entities": bio_entities
    }


# Example usage:
# claim_data = prepare_claim_payload("NAD+ supplementation increases lifespan in mammals")
# print(claim_data)
