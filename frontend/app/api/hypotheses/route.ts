import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const { text, context, paperId, domain } = await request.json();

    if (!text && !paperId) {
      return NextResponse.json(
        { error: 'Either text or paperId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/hypotheses/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        research_domain: domain || 'general',
        context_papers: paperId ? [paperId] : undefined,
        methodology_preference: null,
        novelty_threshold: 0.7,
        text_context: text,
        research_context: context
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Hypothesis generation failed: ${errorData}`);
    }

    const result = await response.json();
    
    // Transform backend response to match frontend expectations
    const transformedResult = {
      success: true,
      hypotheses: result.data?.hypotheses || result.hypotheses || [],
      status: result.status,
      metadata: {
        timestamp: new Date().toISOString(),
        count: result.data?.hypotheses?.length || 0
      }
    };
    
    return NextResponse.json(transformedResult);

  } catch (error) {
    console.error('Hypothesis generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate hypotheses' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // For now, return mock hypotheses since the backend doesn't have a GET endpoint
    // In production, this would fetch from a database
    const mockHypotheses = [
      {
        id: "hyp_1",
        title: "AI-Enhanced Drug Discovery in Oncology",
        description: "Machine learning algorithms could accelerate the identification of novel anti-cancer compounds by analyzing molecular structure-activity relationships across large chemical databases.",
        confidence: 0.85,
        status: "draft",
        domain: "medicine",
        relatedPapers: ["paper_1", "paper_2"],
        supportingEvidence: [
          "Recent ML advances show 40% improvement in hit identification",
          "Large pharma companies are investing heavily in AI drug discovery"
        ],
        potentialExperiments: [
          "Virtual screening of 1M+ compounds",
          "In vitro validation of top 100 candidates",
          "Animal model testing"
        ],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        tags: ["AI", "drug-discovery", "oncology", "machine-learning"],
        priority: "high"
      },
      {
        id: "hyp_2", 
        title: "CRISPR-Cas9 Applications in Neurodegeneration",
        description: "Gene editing using CRISPR-Cas9 could provide therapeutic strategies for Alzheimer's disease by targeting amyloid-beta production pathways.",
        confidence: 0.78,
        status: "testing",
        domain: "biology",
        relatedPapers: ["paper_3", "paper_4"],
        supportingEvidence: [
          "Successful CRISPR applications in mouse models",
          "Identified key genetic targets for amyloid reduction"
        ],
        potentialExperiments: [
          "Cell culture validation studies",
          "Transgenic mouse model testing",
          "Safety assessment protocols"
        ],
        createdAt: "2024-01-12T14:30:00Z",
        updatedAt: "2024-01-14T09:15:00Z",
        tags: ["CRISPR", "neurodegeneration", "Alzheimer", "gene-editing"],
        priority: "medium"
      },
      {
        id: "hyp_3",
        title: "Quantum Computing for Climate Modeling",
        description: "Quantum algorithms could dramatically improve the accuracy and speed of climate change predictions by processing complex atmospheric data.",
        confidence: 0.65,
        status: "validated",
        domain: "physics",
        relatedPapers: ["paper_5"],
        supportingEvidence: [
          "Quantum advantage demonstrated for optimization problems",
          "Climate models require exponentially complex calculations"
        ],
        potentialExperiments: [
          "Quantum algorithm development",
          "Comparison with classical models",
          "Scalability analysis"
        ],
        createdAt: "2024-01-10T16:45:00Z",
        updatedAt: "2024-01-13T11:20:00Z",
        tags: ["quantum-computing", "climate", "modeling", "algorithms"],
        priority: "low"
      }
    ].slice(0, limit);

    return NextResponse.json(mockHypotheses);

  } catch (error) {
    console.error('Hypotheses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hypotheses' },
      { status: 500 }
    );
  }
} 