import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '20';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const journal = searchParams.get('journal');
    const author = searchParams.get('author');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    let url = `${BACKEND_URL}/api/pubmed/search?query=${encodeURIComponent(query)}&limit=${limit}`;
    
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    if (journal) url += `&journal=${encodeURIComponent(journal)}`;
    if (author) url += `&author=${encodeURIComponent(author)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`PubMed search failed: ${errorData}`);
    }

    const results = await response.json();
    return NextResponse.json(results);

  } catch (error) {
    console.error('PubMed search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search PubMed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { pmid, action } = await request.json();

    if (!pmid) {
      return NextResponse.json(
        { error: 'PMID is required' },
        { status: 400 }
      );
    }

    let endpoint = '';
    switch (action) {
      case 'fetch_details':
        endpoint = 'fetch-details';
        break;
      case 'analyze':
        endpoint = 'analyze-paper';
        break;
      case 'semantic_search':
        endpoint = 'semantic-search';
        break;
      default:
        endpoint = 'fetch-details';
    }

    const response = await fetch(`${BACKEND_URL}/api/pubmed/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pmid }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`PubMed operation failed: ${errorData}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('PubMed operation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PubMed request' },
      { status: 500 }
    );
  }
} 