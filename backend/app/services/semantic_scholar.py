import requests
from typing import Dict, List

BASE_URL = "https://api.semanticscholar.org/graph/v1"


def fetch_paper_details(paper_id: str) -> Dict:
    try:
        url = f"{BASE_URL}/paper/{paper_id}"
        params = {"fields": "abstract,authors.name,authors.authorId"}
        response = requests.get(url, params=params, timeout=10)
        if response.status_code != 200:
            return {}
        data = response.json()
        return {
            "abstract": data.get("abstract"),
            "authors": [
                {
                    "name": a.get("name"),
                    "author_id": a.get("authorId"),
                    "author_url": f"https://www.semanticscholar.org/author/{a.get('name', '').replace(' ', '-')}/{a.get('authorId')}"
                }
                for a in data.get("authors", [])
            ]
        }
    except Exception as e:
        print(f"Failed to fetch details for paper {paper_id}: {e}")
        return {}


def get_citations_and_references(doi: str) -> Dict:
    if not doi:
        return {
            "url": None,
            "authors": [],
            "citation_count": 0,
            "reference_count": 0,
            "citations": [],
            "references": []
        }

    url = f"{BASE_URL}/paper/DOI:{doi}"
    params = {
        "fields": ",".join([
            "title", "url", "authors.name", "authors.authorId",
            "citationCount", "referenceCount",
            "citations.paperId", "citations.url", "citations.title", "citations.venue", "citations.year",
            "references.paperId", "references.url", "references.title", "references.venue", "references.year"
        ])
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        print("Request URL:", response.url)
        if response.status_code != 200:
            print("Semantic Scholar API error:", response.status_code)
            return {
                "url": None,
                "authors": [],
                "citation_count": 0,
                "reference_count": 0,
                "citations": [],
                "references": []
            }

        data = response.json()

        if not data or "title" not in data:
            print("DOI not found or response invalid.")
            return {
                "url": None,
                "authors": [],
                "citation_count": 0,
                "reference_count": 0,
                "citations": [],
                "references": []
            }

        authors = [
            {
                "name": a.get("name"),
                "author_id": a.get("authorId"),
                "author_url": f"https://www.semanticscholar.org/author/{a.get('name', '').replace(' ', '-')}/{a.get('authorId')}"
            }
            for a in data.get("authors", [])
        ]

        def parse_papers(papers):
            result = []
            for paper in papers[:3]:  # Only enrich top 3
                enriched = fetch_paper_details(paper.get("paperId"))
                result.append({
                    "paperId": paper.get("paperId"),
                    "url": paper.get("url"),
                    "title": paper.get("title"),
                    "venue": paper.get("venue"),
                    "year": paper.get("year"),
                    "abstract": enriched.get("abstract"),
                    "authors": enriched.get("authors", [])
                })
            return result

        return {
            "url": data.get("url"),
            "authors": authors,
            "citation_count": data.get("citationCount", 0),
            "reference_count": data.get("referenceCount", 0),
            "citations": parse_papers(data.get("citations", [])),
            "references": parse_papers(data.get("references", []))
        }

    except Exception as e:
        print("Semantic Scholar API error:", e)
        return {
            "url": None,
            "authors": [],
            "citation_count": 0,
            "reference_count": 0,
            "citations": [],
            "references": []
        }
