import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const text = formData.get('text') as string;
    const extractEntities = formData.get('extractEntities') === 'true';
    const detectNullResults = formData.get('detectNullResults') === 'true';
    const generateSummary = formData.get('generateSummary') === 'true';
    const generateHypotheses = formData.get('generateHypotheses') === 'true';
    const qualityAssessment = formData.get('qualityAssessment') === 'true';
    const fairAssessment = formData.get('fairAssessment') === 'true';

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // If file is provided, read the content directly and analyze
    if (file) {
      try {
        // Read file content directly
        const fileContent = await file.text();

        // Analyze the file content
        const analysisResponse = await fetch(`${backendUrl}/api/analyze/paper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: fileContent,
            title: file.name,
          extract_entities: extractEntities,
          detect_null_results: detectNullResults,
          generate_summary: generateSummary,
          generate_hypotheses: generateHypotheses,
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.text();
        throw new Error(`Analysis failed: ${errorData}`);
      }

      const analysisResult = await analysisResponse.json();
      return NextResponse.json({
        success: true,
        data: analysisResult,
        source: 'file',
        filename: file.name,
      });
      } catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // If text is provided directly
    if (text) {
      const analysisResponse = await fetch(`${backendUrl}/api/analyze/paper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          extract_entities: extractEntities,
          detect_null_results: detectNullResults,
          generate_summary: generateSummary,
          generate_hypotheses: generateHypotheses,
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.text();
        throw new Error(`Analysis failed: ${errorData}`);
      }

      const analysisResult = await analysisResponse.json();
      return NextResponse.json({
        success: true,
        data: analysisResult,
        source: 'text',
      });
    }

    return NextResponse.json({ 
      error: 'No file or text provided for analysis' 
    }, { status: 400 });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}