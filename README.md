# 🧬 DESCI AI ResearchGraph

> **Revolutionizing Scientific Discovery Through AI-Powered Knowledge Graphs**

A comprehensive platform that combines AI-driven research acceleration, blockchain-based identity systems, and knowledge graph tokenization to transform scientific discovery and collaboration.

## 🚀 **Unified Architecture**

ResearchGraph AI is now consolidated into a clean, unified structure:

```
ResearchGraph AI/
├── 📁 frontend/          # Next.js React Application
├── 📁 backend/           # Node.js Express API Server  
├── 📁 contracts/         # Ethereum Smart Contracts
├── 📄 README.md          # This file
├── 📄 package.json       # Root package configuration
└── 📄 .cursorrules       # Development guidelines
```

## ✨ **Core Features**

### 🧠 **AI-Powered Research Analysis**
- **FAIR Metadata Extraction**: Automatically extract research-compliant metadata from repositories
- **Null Results Detection**: Identify and analyze valuable negative results in scientific papers
- **Hypothesis Generation**: AI-driven generation of novel, testable research hypotheses
- **Paper Analysis**: Comprehensive analysis of research papers with entity extraction

### 🔗 **Knowledge Graph Engine**
- **3D Visualization**: Interactive exploration of research connections
- **Real-time Collaboration**: Live synchronization across research teams
- **Semantic Search**: Advanced search capabilities across scientific literature
- **Relationship Mapping**: Automatic discovery of hidden research connections

### 🏛️ **Decentralized Science (DeSci)**
- **Research IP NFTs**: Tokenize and protect intellectual property
- **Research DAOs**: Decentralized funding and governance for research projects
- **Milestone-based Funding**: Transparent, achievement-based research funding
- **Peer Review Network**: Decentralized peer review with reputation tracking

### 🌐 **Collaborative Platform**
- **Multi-institutional Support**: Connect researchers across institutions
- **Real-time Updates**: Live collaboration with instant synchronization
- **Version Control**: Track research evolution and contributions
- **Citation Tracking**: Automatic citation analysis and relationship mapping

## 🛠️ **Technology Stack**

### **Frontend**
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: Zustand for global state
- **Animation**: Framer Motion

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for performance optimization
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer with type validation
- **Real-time**: Socket.io for live collaboration

### **Blockchain**
- **Platform**: Ethereum with Hardhat
- **Standards**: ERC-721 for Research IP NFTs
- **Security**: OpenZeppelin contracts
- **Storage**: IPFS for decentralized file storage

### **AI/ML**
- **Language Models**: OpenAI GPT-4, Anthropic Claude
- **Document Processing**: PDF parsing, DOCX extraction
- **Analysis**: Research paper analysis, hypothesis generation
- **Metadata**: FAIR-compliant metadata extraction

## 📦 **Installation**

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Redis server
- Git

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bio
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 🔧 **Configuration**

### **Environment Variables**

Copy `backend/env.example` to `backend/.env` and configure:

```env
# Required
OPENAI_API_KEY=your-openai-api-key
MONGODB_URI=mongodb://localhost:27017/researchgraph
JWT_SECRET=your-jwt-secret

# Optional
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=your-anthropic-key
ETHEREUM_RPC_URL=your-ethereum-rpc
```

## 🚀 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Research Analysis**
- `POST /api/analysis/null-results` - Analyze for null results
- `POST /api/analysis/paper` - Comprehensive paper analysis
- `POST /api/analysis/hypotheses` - Generate research hypotheses

### **Metadata Extraction**
- `POST /api/metadata/extract` - Extract FAIR metadata from repositories

### **Knowledge Graph**
- `GET /api/knowledge-graph` - Get knowledge graph data
- `POST /api/knowledge-graph` - Create/update knowledge graph

### **DeSci (Decentralized Science)**
- `POST /api/desci/mint-nft` - Mint research IP NFT
- `GET /api/desci/nfts` - Get all NFTs
- `POST /api/desci/create-dao` - Create research DAO
- `GET /api/desci/daos` - Get all DAOs

### **Papers**
- `GET /api/papers` - Get all papers
- `POST /api/papers` - Add new paper
- `GET /api/papers/:id` - Get paper by ID

## 🎯 **Key Features in Detail**

### **FAIR Metadata Extraction**
Automatically extract research-compliant metadata from GitHub/GitLab repositories:
- Repository analysis with AI
- Author and contributor identification
- Dependency and license detection
- Citation format generation

### **Null Results Detection**
Identify valuable negative results in scientific papers:
- AI-powered analysis of research papers
- Significance assessment of null results
- Reporting quality evaluation
- Recommendations for better utilization

### **Hypothesis Generation**
Generate novel research hypotheses:
- Content-based hypothesis generation
- Domain-specific constraints
- Methodology suggestions
- Impact assessment

### **Research IP NFTs**
Tokenize intellectual property on blockchain:
- Multi-contributor support
- Citation tracking
- Licensing mechanisms
- DOI integration

## 🔐 **Security Features**

- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size restrictions
- **JWT Authentication**: Secure token-based auth
- **Error Handling**: Secure error responses
- **CORS Protection**: Cross-origin request security

## 🧪 **Development**

### **Project Structure**
```
backend/
├── routes/           # API route handlers
├── middleware/       # Express middleware
├── models/          # Database models
├── services/        # Business logic
└── server.js        # Main server file

frontend/
├── app/             # Next.js app directory
├── components/      # React components
├── lib/             # Utility functions
└── hooks/           # Custom React hooks

contracts/
├── ResearchIPNFT.sol    # Research IP NFT contract
└── ResearchDAO.sol      # Research DAO contract
```

### **Development Commands**
```bash
# Backend
npm run dev          # Start development server
npm run start        # Start production server
npm run lint         # Run ESLint

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Next.js linting
```

## 🌟 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 **Support**

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our research community discussions

## 🎯 **Roadmap**

- [ ] **Phase 1**: Core platform stabilization
- [ ] **Phase 2**: Advanced AI features and integrations
- [ ] **Phase 3**: Blockchain integration and DeSci features
- [ ] **Phase 4**: Multi-institutional deployment
- [ ] **Phase 5**: Global research network expansion

---

**Built with ❤️ by the ResearchGraph AI Team**

*Transforming scientific discovery through AI-powered knowledge graphs and decentralized collaboration.* 