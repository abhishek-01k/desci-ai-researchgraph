from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.pubmed import search_and_extract
from app.services.pubmed_for_semantic import search_and_extract_semantic, build_embedding_text
from app.services.similarity_search import rank_articles_by_similarity
from app.services.llm_null_analysis import check_null_hypothesis
from app.services.similarity_search import handle_similarity_search_full

router = APIRouter()

class ClaimRequest(BaseModel):
    claim: str

# @router.post("/pubmed/search")
# def search_pubmed(request: ClaimRequest):
#     try:
#         results = search_and_extract(request.claim)
#         return {"results": results}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_pubmed(request: ClaimRequest):
    try:
        results = await search_and_extract(request.claim)  # ✅ await here
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/build-semantic-search")
async def search_pubmed(request: ClaimRequest):
    try:
        results = await search_and_extract_semantic(request.claim)

        # Build semantic strings for each article
        enriched = [
            {
                "title": article.get("title"),
                "doi" : article.get("doi"),
                "pmid" : article.get("pmid"),
                "pubmed_url" : article.get("pubmed_url"),
                "abstract": article.get("abstract"),
                "mesh_terms": article.get("mesh_terms"),
                "semantic_string": build_embedding_text(article)
            }
            for article in results
        ]

        return {"results": enriched}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/embed/do/similarity-search")
async def similarity_search(request: ClaimRequest):
    try:
        articles = await search_and_extract_semantic(request.claim)
        
        simplified = [
            {
                "title": article.get("title"),
                "abstract": article.get("abstract"),
                "mesh_terms": article.get("mesh_terms"),
                "semantic_string": build_embedding_text(article)
            }
            for article in articles
        ]

        # Rank by similarity to the claim
        # ranked = rank_articles_by_similarity(request.claim, simplified)
        ranked = rank_articles_by_similarity(request.claim, simplified)
        top_5 = ranked[:5]

        # LLM-based verdict
        verdict_info = check_null_hypothesis(request.claim, top_5)

        # return {"results": ranked}
        return {
            "results": top_5,
            "verdict": verdict_info.get("verdict"),
            "summary": verdict_info.get("summary"),
            "reasoning": verdict_info.get("reasoning")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/embed/do/similarity-search/full")
async def similarity_search_full(request: ClaimRequest):
    return await handle_similarity_search_full(request.claim)