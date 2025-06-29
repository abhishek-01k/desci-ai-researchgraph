import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { extractGitHubContent, extractGitLabContent } from '@/lib/extractors';
import { processRepositoryData } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    const platform = url.includes('github.com') ? 'github' : 'gitlab';
    const cookieStore = cookies();
    const token = cookieStore.get(`vcs-token-${platform}`)?.value;

    const content = platform === 'github' 
      ? await extractGitHubContent(url, token)
      : await extractGitLabContent(url, token); 

    const llmApiUrl = process.env.LLM_API_URL || 'https://your-default-llm-api-url.com/generate_ollama_response';
    const llmModelName = process.env.LLM_MODEL_NAME || 'metadata-extractor';

    try {
      const llmResponse = await fetch(llmApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: content,
          model: llmModelName,
        }),
      });

      if (!llmResponse.ok) {
        const errorData = await llmResponse.text();
        console.error('LLM API error:', errorData);
        throw new Error(`LLM API request failed with status ${llmResponse.status}: ${errorData}`);
      }

      const llmResult = await llmResponse.json();
      console.log('LLM API response:', llmResult);
      
      const { success, responseData, formattedRawResponse, message } = processRepositoryData(llmResult);
      
      return NextResponse.json({
        success,
        data: responseData,
        parsingError: !success,
        message,
        rawResponse: formattedRawResponse
      });

    } catch (llmError) {
      console.error('Error calling LLM API:', llmError);
      return NextResponse.json(
        { error: llmError instanceof Error ? llmError.message : 'Failed to get results from LLM' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze repository' },
      { status: 500 }
    );
  }
}