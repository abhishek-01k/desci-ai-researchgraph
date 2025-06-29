# pytest tests/test_text_normalize_service.py

import pytest
from app.services.text_normalize_service import normalize_text

def test_removes_symbols_and_trims():
    input_text = " NAD+ improves lifespan!?? "
    expected = "nad+ improves lifespan"
    assert normalize_text(input_text) == expected

def test_stopword_removal_enabled():
    input_text = "The effectiveness of fasting is significant."
    expected = "effectiveness fasting significant"
    assert normalize_text(input_text, remove_stopwords=True) == expected

def test_stopword_removal_disabled():
    input_text = "The effectiveness of fasting is significant."
    expected = "the effectiveness of fasting is significant"
    assert normalize_text(input_text, remove_stopwords=False) == expected.lower()

def test_preserves_scientific_symbols():
    input_text = "α-Synuclein is toxic + dangerous"
    expected = "α-synuclein is toxic + dangerous"
    assert normalize_text(input_text) == expected.lower()


    
