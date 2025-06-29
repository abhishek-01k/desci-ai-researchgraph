import io
import fitz  # PyMuPDF
from docx import Document

async def extract_text_from_file(file):
    filename = file.filename.lower()
    content = await file.read()

    if filename.endswith(".pdf"):
        return extract_pdf(content)
    elif filename.endswith(".docx"):
        return extract_docx(content)
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        return extract_image(content)
    elif filename.endswith((".mp3", ".wav")):
        return transcribe_audio(content, filename)
    else:
        raise ValueError("Unsupported file type. Only .pdf and .docx are allowed.")

def extract_pdf(file_bytes):
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        return "\n".join(page.get_text() for page in doc)

def extract_docx(file_bytes):
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([p.text for p in doc.paragraphs])

def extract_image(file_bytes):
    return "Image to Text"
    # image = Image.open(io.BytesIO(file_bytes))
    # return pytesseract.image_to_string(image)

def transcribe_audio(file_bytes, filename):
    return "Voice to text"
    # with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[-1]) as tmp:
    #     tmp.write(file_bytes)
    #     result = model.transcribe(tmp.name)
    #     os.remove(tmp.name)
    #     return result["text"]
