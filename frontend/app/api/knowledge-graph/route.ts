import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const { text, paperId, entities, relationships, graphType } = await request.json();

    if (!text && !paperId) {
      return NextResponse.json(
        { error: 'Either text or paperId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/knowledge-graph/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_content: text,
        paper_ids: paperId ? [paperId] : [],
        entities: entities || [],
        relationships: relationships || [],
        layout_algorithm: graphType || 'force_directed',
        include_citations: true,
        depth_limit: 3
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Knowledge graph creation failed: ${errorData}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Knowledge graph creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create knowledge graph' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const graphId = searchParams.get('graphId');
    const paperId = searchParams.get('paperId');
    const query = searchParams.get('query');

    let url = `${BACKEND_URL}/api/neo4j/query-graph`;
    const params = new URLSearchParams();

    if (graphId) params.append('graph_id', graphId);
    if (paperId) params.append('paper_id', paperId);
    if (query) params.append('query', query);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch knowledge graph');
    }

    const graph = await response.json();
    return NextResponse.json(graph);

  } catch (error) {
    console.error('Knowledge graph fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge graph' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { graphId, nodes, edges, metadata } = await request.json();

    if (!graphId) {
      return NextResponse.json(
        { error: 'Graph ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/neo4j/update-graph`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        graph_id: graphId,
        nodes,
        edges,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Knowledge graph update failed: ${errorData}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Knowledge graph update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update knowledge graph' },
      { status: 500 }
    );
  }
} 