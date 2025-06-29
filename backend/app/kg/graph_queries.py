 # Cypher insert/update/query functions
from app.kg.neo4j_connection import run_read_query, run_write_query


# execute_write is meant for mutating operations (like CREATE, MERGE, DELETE).

# If you're only reading (e.g., with MATCH, RETURN), using execute_read is the better and safer choice.

# Neo4j might route read and write operations differently when using clusters, and following best practices helps avoid unexpected behavior at scale.

def insert_claim_graph(data: dict):
    query = """
    MERGE (c:Claim {claim_id: $claim_id})
    SET c.claim = $claim,
        c.cleaned = $cleaned,
        c.semantic_searchable = $semantic_searchable,
        c.source_type = $source_type,
        c.timestamp = $timestamp,
        c.blockchain_hash = $blockchain_hash,
        c.verdict = $verdict,
        c.summary = $summary,
        c.reasoning = $reasoning,
        c.null_hypothesis_detected = $null_hypothesis_detected

    // Link biomedical entities by type
    FOREACH (etype IN keys($biomedical_entities) |
        FOREACH (ename IN $biomedical_entities[etype] |
            MERGE (e:Entity {name: ename})
            SET e.type = etype
            MERGE (c)-[:MENTIONS]->(e)
        )
    )

    // Link articles and their metadata
    FOREACH (article IN $semantic_results |
        MERGE (a:Article {pmid: article.pmid})
        SET a.title = article.title,
            a.abstract = article.abstract,
            a.journal = article.journal,
            a.journal_abbrev = article.journal_abbrev,
            a.doi = article.doi,
            a.year = article.year,
            a.publication_date = article.publication_date,
            a.language = article.language,
            a.article_types = article.article_types,
            a.mesh_terms = article.mesh_terms,
            a.pubmed_url = article.pubmed_url,
            a.pmc_url = article.pmc_url

        MERGE (c)-[r:EVIDENCED_BY]->(a)
        SET r.similarity = article.similarity

        // Link authors and affiliations
        FOREACH (i IN range(0, size(article.authors)-1) |
            MERGE (author:Author {name: article.authors[i]})
            MERGE (a)-[:AUTHORED_BY]->(author)

            // Check if index exists before linking affiliation
            FOREACH (aff IN [article.affiliations[i]] |
                MERGE (org:Affiliation {name: aff})
                MERGE (author)-[:AFFILIATED_WITH]->(org)
            )
        )
    )

    // Optional: Track data provenance
    MERGE (p:Process {source: 'FastAPI Pipeline', timestamp: $timestamp})
    MERGE (c)-[:GENERATED_BY]->(p)
    """
    run_write_query(query, parameters=data)



def get_claim_by_id(claim_id: str) -> dict:
    query = """
            MATCH (c:Claim {claim_id: $claim_id})
            OPTIONAL MATCH (c)-[:MENTIONS]->(e:Entity)
            WITH c, collect(DISTINCT {name: e.name, type: e.type}) AS entities

            OPTIONAL MATCH (c)-[r:EVIDENCED_BY]->(a:Article)
            OPTIONAL MATCH (a)-[:AUTHORED_BY]->(author:Author)
            OPTIONAL MATCH (author)-[:AFFILIATED_WITH]->(org:Affiliation)

            WITH c, entities, a, r,
                collect(DISTINCT author.name) AS authors,
                collect(DISTINCT org.name) AS affiliations

            RETURN 
            c,
            entities,
            collect(DISTINCT {
                pmid: a.pmid,
                title: a.title,
                abstract: a.abstract,
                doi: a.doi,
                journal: a.journal,
                journal_abbrev: a.journal_abbrev,
                publication_date: a.publication_date,
                year: a.year,
                language: a.language,
                article_types: a.article_types,
                mesh_terms: a.mesh_terms,
                pubmed_url: a.pubmed_url,
                pmc_url: a.pmc_url,
                similarity: r.similarity,
                authors: authors,
                affiliations: affiliations
            }) AS articles

    """
    result = run_read_query(query, parameters={"claim_id": claim_id})
    if not result:
        return None
    row = result[0]
    return {
        "claim": row["c"],
        "entities": row["entities"],
        "semantic_results": row["articles"]
    }



def get_minimal_claim_by_id(claim_id: str) -> dict:
    query = """
    MATCH (c:Claim {claim_id: $claim_id})
    RETURN {
      claim_id: c.claim_id,
      claim: c.claim,
      cleaned: c.cleaned,
      semantic_searchable: c.semantic_searchable,
      source_type: c.source_type,
      timestamp: c.timestamp,
      blockchain_hash: c.blockchain_hash,
      verdict: c.verdict,
      summary: c.summary,
      reasoning: c.reasoning,
      null_hypothesis_detected: c.null_hypothesis_detected
    } AS claim
    """
    result = run_read_query(query, parameters={"claim_id": claim_id})
    return result[0]["claim"] if result else None






# MATCH (c:Claim {claim_id: "8f14e45f-ea8c-4a18-9143-dc9b3ea3df62"})
# RETURN c