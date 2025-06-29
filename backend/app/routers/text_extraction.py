from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.text_extractor_service import extract_text_from_file

router = APIRouter()

@router.post(
        "/extract-text", 
        summary="Extract text from PDF or DOCX only",
        description="Accepts PDF or Word files and extracts raw plain text for NLP tasks.",
        tags=["Text Extraction"]
        )
async def extract_text(file: UploadFile = File(...)):
    try:
        text = await extract_text_from_file(file)
        return {"extracted_text": text}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
