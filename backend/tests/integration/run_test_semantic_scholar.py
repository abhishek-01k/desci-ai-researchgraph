import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.semantic_scholar import get_citations_and_references

# doi = "10.1042/BSR20221625"
doi = "10.1038/s42255-024-00997-x"
result = get_citations_and_references(doi)

import json
print(json.dumps(result, indent=2))
