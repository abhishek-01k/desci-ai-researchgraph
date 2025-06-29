import os
import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

router = APIRouter()

# Initialize OpenAI client using env var
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def encode_image(file: UploadFile) -> str:
    return base64.b64encode(file.file.read()).decode()

@router.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    prompt: Optional[str] = "What text is in this image?"
):
    try:
        image_base64 = encode_image(file)

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )

        return {"result": response.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
