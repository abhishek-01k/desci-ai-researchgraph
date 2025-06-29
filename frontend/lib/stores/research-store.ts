import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  doi?: string;
  pmid?: string;
  journal?: string;
  year?: number;
  keywords?: string[];
  uploadedAt: string;
  analysisStatus: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysisResults?: AnalysisResult;
}

export interface AnalysisResult {
  id: string;
  paperId: string;
  summary: string;
  keyFindings: string[];
  hypotheses: string[];
  qualityScore: number;
  nullResultsDetected: boolean;
  entities: ExtractedEntity[];
  metadata: ResearchMetadata;
  createdAt: string;
}

export interface ExtractedEntity {
  name: string;
  type: 'gene' | 'protein' | 'disease' | 'chemical' | 'organism' | 'method';
  confidence: number;
  mentions: number;
}

export interface ResearchMetadata {
  methodology: string[];
  datasets: string[];
  tools: string[];
  reproducibility: {
    score: number;
    factors: string[];
  };
  fairness: {
    findable: boolean;
    accessible: boolean;
    interoperable: boolean;
    reusable: boolean;
  };
}

export interface KnowledgeGraph {
  id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
}

interface ResearchState {
  papers: ResearchPaper[];
  analyses: AnalysisResult[];
  knowledgeGraphs: KnowledgeGraph[];
  selectedPaper: ResearchPaper | null;
  selectedAnalysis: AnalysisResult | null;
  selectedGraph: KnowledgeGraph | null;
  isLoading: boolean;
  error: string | null;
}

interface ResearchActions {
  // Papers
  addPaper: (paper: Omit<ResearchPaper, 'id' | 'uploadedAt'>) => void;
  updatePaper: (id: string, updates: Partial<ResearchPaper>) => void;
  deletePaper: (id: string) => void;
  selectPaper: (paper: ResearchPaper) => void;
  
  // Analysis
  startAnalysis: (paperId: string) => Promise<void>;
  addAnalysis: (analysis: AnalysisResult) => void;
  selectAnalysis: (analysis: AnalysisResult) => void;
  
  // Knowledge Graphs
  createKnowledgeGraph: (graph: Omit<KnowledgeGraph, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateKnowledgeGraph: (id: string, updates: Partial<KnowledgeGraph>) => void;
  deleteKnowledgeGraph: (id: string) => void;
  selectKnowledgeGraph: (graph: KnowledgeGraph) => void;
  
  // Utilities
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type ResearchStore = ResearchState & ResearchActions;

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      papers: [],
      analyses: [],
      knowledgeGraphs: [],
      selectedPaper: null,
      selectedAnalysis: null,
      selectedGraph: null,
      isLoading: false,
      error: null,

      // Actions
      addPaper: (paper) => {
        const newPaper: ResearchPaper = {
          ...paper,
          id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString(),
        };
        set((state) => ({
          papers: [...state.papers, newPaper],
        }));
      },

      updatePaper: (id, updates) => {
        set((state) => ({
          papers: state.papers.map((paper) =>
            paper.id === id ? { ...paper, ...updates } : paper
          ),
        }));
      },

      deletePaper: (id) => {
        set((state) => ({
          papers: state.papers.filter((paper) => paper.id !== id),
          selectedPaper: state.selectedPaper?.id === id ? null : state.selectedPaper,
        }));
      },

      selectPaper: (paper) => {
        set({ selectedPaper: paper });
      },

      startAnalysis: async (paperId) => {
        set({ isLoading: true, error: null });
        
        try {
          // Update paper status
          get().updatePaper(paperId, { analysisStatus: 'analyzing' });
          
          const response = await fetch('/api/analyze/paper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paperId }),
          });

          if (!response.ok) {
            throw new Error('Analysis failed');
          }

          const analysisResult = await response.json();
          
          // Update paper and add analysis
          get().updatePaper(paperId, { analysisStatus: 'completed' });
          get().addAnalysis(analysisResult);
          
          set({ isLoading: false });
        } catch (error) {
          get().updatePaper(paperId, { analysisStatus: 'failed' });
          set({
            error: error instanceof Error ? error.message : 'Analysis failed',
            isLoading: false,
          });
        }
      },

      addAnalysis: (analysis) => {
        set((state) => ({
          analyses: [...state.analyses, analysis],
        }));
      },

      selectAnalysis: (analysis) => {
        set({ selectedAnalysis: analysis });
      },

      createKnowledgeGraph: (graph) => {
        const newGraph: KnowledgeGraph = {
          ...graph,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          knowledgeGraphs: [...state.knowledgeGraphs, newGraph],
        }));
      },

      updateKnowledgeGraph: (id, updates) => {
        set((state) => ({
          knowledgeGraphs: state.knowledgeGraphs.map((graph) =>
            graph.id === id 
              ? { ...graph, ...updates, updatedAt: new Date().toISOString() }
              : graph
          ),
        }));
      },

      deleteKnowledgeGraph: (id) => {
        set((state) => ({
          knowledgeGraphs: state.knowledgeGraphs.filter((graph) => graph.id !== id),
          selectedGraph: state.selectedGraph?.id === id ? null : state.selectedGraph,
        }));
      },

      selectKnowledgeGraph: (graph) => {
        set({ selectedGraph: graph });
      },

      clearError: () => set({ error: null }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'research-storage',
      partialize: (state: ResearchStore) => ({
        papers: state.papers,
        analyses: state.analyses,
        knowledgeGraphs: state.knowledgeGraphs,
      }),
    }
  )
); 