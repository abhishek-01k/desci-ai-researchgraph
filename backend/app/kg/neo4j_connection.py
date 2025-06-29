import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Load environment variables from .env
load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

# Create Neo4j driver
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


# Run Cypher query with parameters
# For reads
def run_read_query(query: str, parameters: dict = {}):
    with driver.session() as session:
        return session.execute_read(lambda tx: tx.run(query, parameters).data())

# For writes
def run_write_query(query: str, parameters: dict = {}):
    with driver.session() as session:
        return session.execute_write(lambda tx: tx.run(query, parameters).data())
