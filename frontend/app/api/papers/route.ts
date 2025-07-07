import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '20';
    
    let url = `${BACKEND_URL}/api/papers?limit=${limit}`;
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch papers');
    }

    const result = await response.json();
    // Extract papers array from backend response
    const papers = result.data?.papers || result.papers || [];
    return NextResponse.json(papers);

  } catch (error) {
    console.error('Papers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const paperData = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/papers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paperData),
    });

    if (!response.ok) {
      throw new Error('Failed to create paper');
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Papers creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create paper' },
      { status: 500 }
    );
  }
} 