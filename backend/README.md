# 🧬 ResearchGraph AI - Backend API

> **AI-powered research acceleration platform combining knowledge graphs, DeSci, and advanced analytics**

This is the backend API server for ResearchGraph AI, built with FastAPI and PostgreSQL, providing comprehensive research analysis, knowledge graph generation, and decentralized science (DeSci) functionality.

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.10+
- PostgreSQL 14+
- Redis 6+
- Git

### **Installation**

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Database setup**
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   python main.py
   # Or with uvicorn directly:
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

7. **Access the API**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## 🏗️ **Architecture Overview**

### **Core Components**

```
backend/
├── 📁 app/
│   ├── 📁 models/              # SQLAlchemy database models
│   │   ├── user.py             # User, session, collaboration models
│   │   ├── research_paper.py   # Research papers, authors, citations
│   │   └── claim_result.py     # Analysis results storage
│   ├── 📁 services/            # Business logic services
│   │   ├── research_analysis_service.py    # AI-powered analysis
│   │   ├── knowledge_graph_service.py      # Graph generation
│   │   ├── auth_service.py                 # Authentication
│   │   └── blockchain_service.py           # DeSci/Web3 integration
│   ├── 📁 schemas/             # Pydantic request/response models
│   ├── 📁 routers/             # API route handlers
│   └── database.py             # Database configuration
├── 📁 alembic/                 # Database migrations
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
└── env.example                 # Environment variables template
```

### **Database Schema**

The backend uses PostgreSQL with comprehensive models for research data:

- **Users & Authentication**: User profiles, sessions, collaborations
- **Research Papers**: Papers, authors, keywords, citations
- **Knowledge Graphs**: Graph nodes, edges, clusters
- **AI Analysis**: Analysis results, hypotheses, entity extraction
- **DeSci Integration**: NFT tokens, DAO governance

## 📚 **API Endpoints**

### **🔐 Authentication**
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/refresh      # Token refresh
```

### **📄 Research Papers**
```
GET    /api/papers          # List papers with pagination
POST   /api/papers          # Upload new paper
GET    /api/papers/{id}     # Get paper details
PUT    /api/papers/{id}     # Update paper
DELETE /api/papers/{id}     # Delete paper
```

### **🧠 AI Analysis**
```
POST /api/analyze/paper           # Comprehensive paper analysis
POST /api/analyze/null-results    # Null results detection
POST /api/analyze/entities        # Entity extraction
POST /api/analyze/quality         # Quality assessment
```

### **🕸️ Knowledge Graphs**
```
POST /api/knowledge-graph/build   # Build interactive graph
GET  /api/knowledge-graph/saved   # Get user's saved graphs
GET  /api/knowledge-graph/{id}    # Get specific graph
POST /api/knowledge-graph/export  # Export graph data
```

### **💡 Hypothesis Generation**
```
POST /api/hypotheses/generate     # Generate research hypotheses
GET  /api/hypotheses             # List user's hypotheses
POST /api/hypotheses/validate    # Validate hypothesis
```

### **📊 Metadata Extraction**
```
POST /api/extract/metadata       # Extract FAIR metadata
POST /api/extract/repository     # Analyze code repository
POST /api/extract/citations      # Extract citation data
```

### **🌐 DeSci (Decentralized Science)**
```
POST /api/desci/mint-nft         # Mint research IP NFT
POST /api/desci/create-dao       # Create research DAO
GET  /api/desci/nfts            # List user's NFTs
GET  /api/desci/daos            # List DAOs
```

### **📈 Analytics & Reporting**
```
GET /api/analytics/overview      # Research analytics dashboard
GET /api/analytics/citations     # Citation analysis
GET /api/analytics/trends        # Research trends
```

## 🔧 **Configuration**

### **Environment Variables**

Key environment variables (see `env.example` for complete list):

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=researchgraph_ai

# AI Services
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Authentication
JWT_SECRET=your-jwt-secret
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Blockchain
ETHEREUM_RPC_URL=your-ethereum-rpc
PRIVATE_KEY=your-private-key

# External APIs
PUBMED_API_KEY=your-pubmed-key
GITHUB_TOKEN=your-github-token
```

### **Database Configuration**

The application uses Alembic for database migrations:

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🧪 **Development**

### **Code Style & Standards**

- **Python**: Follow PEP 8 with Black formatting
- **Type Hints**: Use comprehensive type annotations
- **Documentation**: Docstrings for all public functions
- **Testing**: Pytest with >80% coverage

### **Development Commands**

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Format code
black .
isort .

# Lint code
flake8 .
mypy .

# Run tests
pytest
pytest --cov=app tests/  # With coverage

# Run with auto-reload
uvicorn main:app --reload

# Database operations
alembic upgrade head           # Apply migrations
alembic revision --autogenerate -m "message"  # Create migration
```

### **Testing**

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_research_analysis.py

# Run with verbose output
pytest -v
```

## 🔍 **Key Features**

### **🧠 AI-Powered Analysis**

- **Null Results Detection**: Identify valuable negative findings
- **Entity Extraction**: Extract biomedical entities (genes, proteins, diseases)
- **Quality Assessment**: Evaluate research methodology and data quality
- **Hypothesis Generation**: Generate novel, testable research hypotheses

### **🕸️ Knowledge Graph Engine**

- **3D Visualization**: Interactive force-directed graph layouts
- **Cluster Detection**: Automatic research community identification
- **Relationship Mapping**: Citation and collaboration networks
- **Real-time Updates**: Live graph updates as new papers are added

### **📊 FAIR Metadata Extraction**

- **Repository Analysis**: Extract metadata from GitHub/GitLab repos
- **Compliance Assessment**: Evaluate FAIR data principles adherence
- **Citation Generation**: Automatic citation format generation
- **Dependency Analysis**: Code dependency and license detection

### **🌐 DeSci Integration**

- **Research IP NFTs**: Tokenize intellectual property on blockchain
- **Research DAOs**: Decentralized funding and governance
- **IPFS Storage**: Decentralized file storage for research data
- **Smart Contracts**: Automated milestone-based funding

## 🔒 **Security**

### **Authentication & Authorization**

- **JWT Tokens**: Secure token-based authentication
- **OAuth Integration**: Google and ORCID OAuth support
- **Role-based Access**: Granular permission system
- **Session Management**: Secure session handling

### **Data Protection**

- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Secure cross-origin requests

### **Blockchain Security**

- **Private Key Management**: Secure key storage
- **Transaction Verification**: Smart contract interaction safety
- **Multi-signature Support**: Enhanced security for DAOs

## 📊 **Performance**

### **Optimization Strategies**

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Async Processing**: Non-blocking I/O operations
- **Connection Pooling**: Efficient database connections

### **Monitoring**

- **Health Checks**: Comprehensive system health monitoring
- **Logging**: Structured logging with different levels
- **Metrics**: Performance metrics collection
- **Error Tracking**: Sentry integration for error monitoring

## 🚀 **Deployment**

### **Docker Deployment**

```bash
# Build image
docker build -t researchgraph-ai-backend .

# Run container
docker run -p 8000:8000 --env-file .env researchgraph-ai-backend
```

### **Production Considerations**

- **Environment Variables**: Use secure secret management
- **Database**: Use managed PostgreSQL service
- **Caching**: Redis cluster for high availability
- **Load Balancing**: Multiple instance deployment
- **SSL/TLS**: HTTPS termination at load balancer
- **Monitoring**: Comprehensive logging and metrics

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards and add tests
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**: Describe changes and impact

### **Development Guidelines**

- Write comprehensive tests for new features
- Update documentation for API changes
- Follow existing code style and patterns
- Ensure all tests pass before submitting PR
- Add type hints for all new functions

## 📞 **Support**

- **Documentation**: Check `/docs` endpoint for API documentation
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Email**: technical-support@researchgraph.ai

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ for the research community**

*Accelerating scientific discovery through AI-powered knowledge graphs and decentralized collaboration.*
