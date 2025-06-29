from fastapi import APIRouter, HTTPException
from app.kg.graph_queries import get_claim_by_id, get_minimal_claim_by_id, insert_claim_graph
from app.kg.neo4j_connection import driver

router = APIRouter()

@router.get("/test")
def test_neo4j_connection():
    try:
        with driver.session() as session:
            result = session.run("RETURN 'Neo4j connection works!' AS message")
            message = result.single()["message"]
        return {"status": "success", "message": message}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.post("/claim/to-graph")
async def push_claim_to_kg(claim: dict):
    try:
        insert_claim_graph(claim)
        return {"status": "success", "message": "Claim inserted into the knowledge graph."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insertion failed: {str(e)}")
    
    
@router.get("/claim/from-graph/{claim_id}")
def get_claim_from_kg(claim_id: str):
    try:
        result = get_claim_by_id(claim_id)
        if not result:
            raise HTTPException(status_code=404, detail="Claim not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/claim/basic/{claim_id}")
def get_minimal_claim(claim_id: str):
    claim = get_minimal_claim_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim





# MATCH (c:Claim {claim_id: "8f14e45f-ea8c-4a18-9143-dc9b3ea3df62"})
# RETURN c



