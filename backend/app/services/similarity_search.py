from sentence_transformers import SentenceTransformer, util
import torch
from fastapi import HTTPException
from app.services.pubmed_for_semantic import search_and_extract_semantic, build_embedding_text
from app.services.llm_null_analysis import check_null_hypothesis
from app.schemas.null_verifier_schema import NullVerifierRequest
from langchain.chat_models import ChatOpenAI

# Load embedding model (you can move this to global scope in your router)
model = SentenceTransformer('all-MiniLM-L6-v2')

def rank_articles_by_similarity(claim: str, articles: list, top_k: int = 5):
    if not articles:
        raise HTTPException(status_code=400, detail="No articles provided for similarity ranking.")

    # Step 1: Embed the claim
    claim_embedding = model.encode(claim, convert_to_tensor=True)

    # Step 2: Embed semantic strings from articles
    semantic_texts = [
        article["semantic_string"] for article in articles 
        if article.get("semantic_string")  # skip empty or missing semantic strings
    ]
    
    if not semantic_texts:
        raise HTTPException(status_code=400, detail="No semantic strings available for embedding.")

    article_embeddings = model.encode(semantic_texts, convert_to_tensor=True)

    # Step 3: Compute cosine similarity
    similarities = util.cos_sim(claim_embedding, article_embeddings)[0]

    # Step 4: Rank by similarity
    sorted_indices = torch.argsort(similarities, descending=True)

    # Step 5: Return top-k results with similarity score
    ranked_results = []
    for idx in sorted_indices[:top_k]:
        article = articles[idx]
        ranked_results.append({
            "title": article["title"],
            "abstract": article["abstract"],
            "semantic_string": article["semantic_string"],
            "similarity": round(float(similarities[idx]), 4)
        })

    return ranked_results



async def handle_similarity_search_full(req: NullVerifierRequest):
    try:
        articles = await search_and_extract_semantic(req.claim)
        
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
        # ranked = rank_articles_by_similarity(claim, simplified)
        ranked = rank_articles_by_similarity(req.claim, simplified)
        top_5 = ranked[:5]

        # LLM-based verdict
        llm = ChatOpenAI(temperature=0, model_name=req.model)
        verdict_info = check_null_hypothesis(req.claim, top_5, llm)

        # return {"results": ranked}
        return {
            "results": top_5,
            "verdict": verdict_info.get("verdict"),
            "summary": verdict_info.get("summary"),
            "reasoning": verdict_info.get("reasoning")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))