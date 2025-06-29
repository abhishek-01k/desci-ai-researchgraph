# Knowledge Graph Examples

This directory contains example JSON files that demonstrate the data structures used in ResearchGraph AI's knowledge graph system.

## Files

### `knowledge-graph-simple-example.json`
Simple example showing the basic structure of a research claim with:
- **claim**: Original claim text
- **cleaned**: Normalized version for processing
- **semantic_searchable**: Optimized version for semantic search
- **entities**: List of extracted entities
- **biomedical_entities**: Categorized biomedical entities

**Use case**: Understanding the basic claim processing pipeline

### `knowledge-graph-comprehensive-example.json`
Comprehensive example showing the complete knowledge graph structure with:
- **Claim metadata**: Full claim information with null hypothesis detection
- **Biomedical entities**: Complete entity extraction with types
- **Related papers**: Paper metadata with DOI, similarity scores, URLs
- **Author information**: Author details and relationships
- **Citation networks**: Paper citations and references
- **Neo4j integration**: Cypher queries for graph database creation

**Use case**: 
- Understanding the full knowledge graph schema
- Neo4j database design reference
- API response structure examples
- Testing and development data

## Data Structure Overview

```
Claim → relates to → Papers → written by → Authors
  ↓           ↓
Entities    Citations/References
```

## Neo4j Relationships
- `MENTIONS`: Claim → Entity
- `SUPPORTED_BY`: Claim → Paper  
- `WROTE`: Author → Paper
- `CITED`: Paper → Paper
- `REFERENCES`: Paper → Paper

## Usage
These examples are for:
- **Development**: Understanding data structures
- **Testing**: Sample data for unit tests
- **Documentation**: API response examples
- **Neo4j setup**: Database schema reference

⚠️ **Note**: These are example files only - not used in production code. 