import os
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()
from Bio import Entrez
from typing import List, Dict
from fastapi.concurrency import run_in_threadpool
from app.services.redis_cache import get_cached_pubmed_result, set_cached_pubmed_result
from app.services.semantic_scholar import (
    get_citations_and_references,
)  # Assuming you have this from earlier


Entrez.email = os.getenv("PUBMED_EMAIL")
Entrez.tool = os.getenv("PUBMED_TOOL")
Entrez.api_key = os.getenv("PUBMED_API_KEY")


def _search_and_extract(claim: str, max_results: int = 100) -> List[Dict[str, str]]:
    handle = Entrez.esearch(db="pubmed", term=claim, retmax=max_results)
    record = Entrez.read(handle)
    ids = record.get("IdList", [])

    if not ids:
        return []

    abstracts = []

    for i in range(0, len(ids), 10):
        batch_ids = ids[i : i + 10]
        fetch_handle = Entrez.efetch(db="pubmed", id=batch_ids, retmode="xml")
        fetch_records = Entrez.read(fetch_handle)

        for article in fetch_records.get("PubmedArticle", []):
            medline = article["MedlineCitation"]
            article_data = medline["Article"]

            pmid = medline.get("PMID", "")
            title = article_data.get("ArticleTitle", "")

            # Abstract
            abstract_section = article_data.get("Abstract", {})
            abstract_text = abstract_section.get("AbstractText", [])
            abstract = " ".join(str(x) for x in abstract_text)

            # Authors
            authors = []
            affiliations = []
            for author in article_data.get("AuthorList", []):
                last = author.get("LastName", "")
                first = author.get("ForeName", "")
                full = f"{first} {last}".strip()
                if full:
                    authors.append(full)
                affs = author.get("AffiliationInfo", [])
                for aff in affs:
                    affiliations.append(aff.get("Affiliation", ""))

            # Journal info
            journal = article_data.get("Journal", {}).get("Title", "")
            journal_abbrev = article_data.get("Journal", {}).get("ISOAbbreviation", "")
            pubdate = (
                article_data.get("Journal", {})
                .get("JournalIssue", {})
                .get("PubDate", {})
            )
            publication_date = " ".join(str(v) for v in pubdate.values())

            # DOI
            doi = None
            pubmed_data = article.get("PubmedData", {})
            article_ids = pubmed_data.get("ArticleIdList", [])
            pmcid = None
            for id_entry in article_ids:
                if id_entry.attributes.get("IdType") == "doi":
                    doi = str(id_entry)
                elif id_entry.attributes.get("IdType") == "pmc":
                    pmcid = str(id_entry)

            # Article types
            article_types = article_data.get("PublicationTypeList", [])
            article_types = [str(t) for t in article_types]

            # MeSH terms
            mesh_terms = []
            for mesh in medline.get("MeshHeadingList", []):
                descriptor = mesh.get("DescriptorName", "")
                if descriptor:
                    mesh_terms.append(str(descriptor))

            # Grant support
            grants = []
            for grant in article_data.get("GrantList", []):
                grants.append(
                    {
                        "agency": grant.get("Agency", ""),
                        "country": grant.get("Country", ""),
                        "grant_id": grant.get("GrantID", ""),
                    }
                )

            # Language
            language = article_data.get("Language", "eng")

            # PubMed and PMC links
            pubmed_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None
            pmc_url = (
                f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/" if pmcid else None
            )

            # External enrichment (Semantic Scholar)
            # enrichment = get_citations_and_references(doi)

            # Final article dict
            abstracts.append(
                {
                    "pmid": pmid,
                    "pmcid": pmcid,
                    "pubmed_url": pubmed_url,
                    "pmc_url": pmc_url,
                    "title": title,
                    "abstract": abstract,
                    "authors": authors,
                    "affiliations": affiliations,
                    "journal": journal,
                    "journal_abbrev": journal_abbrev,
                    "publication_date": publication_date,
                    "year": pubdate.get("Year", "Unknown"),
                    "language": language,
                    "article_types": article_types,
                    "mesh_terms": mesh_terms,
                    "grant_support": grants,
                    "doi": doi,
                    # "semantic_url": enrichment["url"],
                    # "semantic_authors": enrichment["authors"],
                    # "citation_count": enrichment["citation_count"],
                    # "reference_count": enrichment["reference_count"],
                    # "citations": enrichment["citations"],
                    # "references": enrichment["references"]
                }
            )
    print("Result not coming from cache")
    return abstracts


# Async wrapper with Redis caching
async def search_and_extract(
    claim: str, max_results: int = 100
) -> List[Dict[str, str]]:
    # Step 1: Try Redis cache
    cached = get_cached_pubmed_result(claim)
    if cached:
        print("Olamide, this is coming from redis cache")
        return cached

    # Step 2: Fetch from PubMed if not cached
    results = await run_in_threadpool(_search_and_extract, claim, max_results)

    # Step 3: Save to Redis
    set_cached_pubmed_result(claim, results)

    return results
