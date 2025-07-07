from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.research_analysis_service import ResearchAnalysisService, AnalysisType

router = APIRouter()

class AnalyzePaperRequest(BaseModel):
    text: str
    title: Optional[str] = None
    extract_entities: Optional[bool] = False
    detect_null_results: Optional[bool] = False
    generate_summary: Optional[bool] = False
    generate_hypotheses: Optional[bool] = False
    quality_assessment: Optional[bool] = False
    fair_assessment: Optional[bool] = False

class AnalyzePaperResponse(BaseModel):
    success: bool
    analysis_results: Dict[str, Any]
    paper_title: Optional[str] = None
    analysis_timestamp: str

# Initialize the service
analysis_service = ResearchAnalysisService()

@router.post(
    "/analyze-paper",
    response_model=AnalyzePaperResponse,
    summary="Analyze research paper text",
    description="Performs comprehensive analysis on research paper text including entity extraction, null results detection, hypothesis generation, and quality assessment.",
    tags=["Research Analysis"]
)
async def analyze_paper(request: AnalyzePaperRequest):
    try:
        # Determine which analysis types to perform based on request parameters
        analysis_types = []
        
        if request.extract_entities:
            analysis_types.append(AnalysisType.ENTITY_EXTRACTION)
        if request.detect_null_results:
            analysis_types.append(AnalysisType.NULL_RESULTS)
        if request.generate_hypotheses:
            analysis_types.append(AnalysisType.HYPOTHESIS_GENERATION)
        if request.quality_assessment:
            analysis_types.append(AnalysisType.QUALITY_ASSESSMENT)
        
        # If no specific analysis types are requested, perform basic analysis
        if not analysis_types:
            analysis_types = [AnalysisType.ENTITY_EXTRACTION, AnalysisType.NULL_RESULTS]
        
        # Perform text-based analysis (simplified version of the service)
        results = await _analyze_text_content(
            text=request.text,
            title=request.title,
            analysis_types=analysis_types
        )
        
        return AnalyzePaperResponse(
            success=True,
            analysis_results=results,
            paper_title=request.title,
            analysis_timestamp=results.get("analysis_timestamp", "")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

async def _analyze_text_content(
    text: str, 
    title: Optional[str], 
    analysis_types: List[AnalysisType]
) -> Dict[str, Any]:
    """Simplified text analysis function for direct text input"""
    from datetime import datetime
    import openai
    import json
    
    results = {
        "analysis_timestamp": datetime.utcnow().isoformat(),
        "text_length": len(text),
        "title": title,
        "analyses": {}
    }
    
    # Initialize OpenAI client
    openai_client = openai.AsyncOpenAI()
    
    try:
        # Perform requested analyses
        for analysis_type in analysis_types:
            if analysis_type == AnalysisType.NULL_RESULTS:
                results["analyses"]["null_results"] = await _analyze_null_results_text(openai_client, text, title)
            elif analysis_type == AnalysisType.ENTITY_EXTRACTION:
                results["analyses"]["entities"] = await _extract_entities_text(openai_client, text, title)
            elif analysis_type == AnalysisType.HYPOTHESIS_GENERATION:
                results["analyses"]["hypotheses"] = await _generate_hypotheses_text(openai_client, text, title)
            elif analysis_type == AnalysisType.QUALITY_ASSESSMENT:
                results["analyses"]["quality"] = await _assess_quality_text(openai_client, text, title)
    
    except Exception as e:
        results["error"] = str(e)
        results["analyses"]["error"] = "Some analyses failed to complete"
    
    return results

async def _analyze_null_results_text(openai_client, text: str, title: Optional[str]) -> Dict[str, Any]:
    """Analyze text for null results"""
    try:
        prompt = f"""
        Analyze the following research paper text for null results (negative findings, non-significant results, failed hypotheses):
        
        Title: {title or 'Not provided'}
        Content: {text[:4000]}
        
        Please provide a JSON response with:
        1. "has_null_results" (boolean)
        2. "confidence_score" (0-1 float)
        3. "null_results" (array of specific findings)
        4. "significance_assessment" (string explanation)
        5. "recommendations" (array of strings)
        """
        
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert research analyst. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "has_null_results": False,
            "confidence_score": 0.0,
            "null_results": [],
            "significance_assessment": f"Analysis failed: {str(e)}",
            "recommendations": []
        }

async def _extract_entities_text(openai_client, text: str, title: Optional[str]) -> Dict[str, Any]:
    """Extract entities from text"""
    try:
        prompt = f"""
        Extract biomedical and scientific entities from the following research paper text:
        
        Title: {title or 'Not provided'}
        Content: {text[:4000]}
        
        Please provide a JSON response with:
        1. "entities" (array of objects with "text", "type", "confidence")
        2. "relationships" (array of objects with "entity1", "entity2", "relationship")
        3. "entity_types" (array of unique entity types found)
        4. "confidence_scores" (object with overall confidence metrics)
        """
        
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert biomedical NLP analyst. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "entities": [],
            "relationships": [],
            "entity_types": [],
            "confidence_scores": {"overall": 0.0},
            "error": str(e)
        }

async def _generate_hypotheses_text(openai_client, text: str, title: Optional[str]) -> Dict[str, Any]:
    """Generate hypotheses based on text"""
    try:
        prompt = f"""
        Based on the following research paper text, generate new research hypotheses and identify research gaps:
        
        Title: {title or 'Not provided'}
        Content: {text[:4000]}
        
        Please provide a JSON response with:
        1. "hypotheses" (array of objects with "hypothesis", "rationale", "confidence")
        2. "research_gaps" (array of identified gaps)
        3. "methodology_suggestions" (array of suggested methods)
        4. "confidence_scores" (array of confidence values for each hypothesis)
        """
        
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert research strategist. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "hypotheses": [],
            "research_gaps": [],
            "methodology_suggestions": [],
            "confidence_scores": [],
            "error": str(e)
        }

async def _assess_quality_text(openai_client, text: str, title: Optional[str]) -> Dict[str, Any]:
    """Assess quality of research text"""
    try:
        prompt = f"""
        Assess the quality of the following research paper text:
        
        Title: {title or 'Not provided'}
        Content: {text[:4000]}
        
        Please provide a JSON response with:
        1. "overall_quality_score" (0-10 scale)
        2. "methodology_quality" (0-10 scale)
        3. "clarity_score" (0-10 scale)
        4. "reproducibility_score" (0-10 scale)
        5. "strengths" (array of identified strengths)
        6. "weaknesses" (array of identified weaknesses)
        7. "improvement_suggestions" (array of suggestions)
        """
        
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert peer reviewer. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "overall_quality_score": 0.0,
            "methodology_quality": 0.0,
            "clarity_score": 0.0,
            "reproducibility_score": 0.0,
            "strengths": [],
            "weaknesses": [],
            "improvement_suggestions": [],
            "error": str(e)
        } 