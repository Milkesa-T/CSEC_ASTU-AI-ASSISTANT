import os
import uuid
import time
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# API & Frameworks
from google import genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from . import auth, models

# RAG Tools
import chromadb
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
from huggingface_hub import login
from sqlalchemy.orm import Session
from . import database

# 1. INITIALIZATION
load_dotenv()  # Critical: Loads your GEMINI_API_KEY from .env
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest") # Default to flash-latest if not set
HF_TOKEN = os.getenv("HF_TOKEN")
if HF_TOKEN:
    login(token=HF_TOKEN)
if not GEMINI_KEY:
    raise ValueError("GEMINI_API_KEY not found! Check your .env file.")

client = genai.Client(api_key=GEMINI_KEY)
router = APIRouter()

# Local embedding model (Free & Fast)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Updated Persistent ChromaDB Client
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="pdf_collection")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 2. SCHEMAS
class QuestionRequest(BaseModel):
    question: str

# 3. UTILS
def extract_text_from_pdf(file_path: Path) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Read Error: {str(e)}")

def chunk_text(text: str, chunk_size: int = 700, overlap: int = 100) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def embed_text(text: str):
    return embedding_model.encode(text).tolist()

@retry(
    stop=stop_after_attempt(3), # Reduced from 5 to 3 to fail faster
    wait=wait_exponential(multiplier=1, min=2, max=5), # Reduced wait time
    retry=retry_if_exception_type((ResourceExhausted, ServiceUnavailable)),
    reraise=True
)
def generate_content_with_retry(model, contents):
    """
    Wraps the Gemini generation with retry logic for rate limits.
    """
    return client.models.generate_content(
        model=model,
        contents=contents,
        config={
             "temperature":0.2,
             "top_p": 0.9
        }
       
    )

# ... (routes) ...



# 4. ROUTES
@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_admin_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = UPLOAD_DIR / file.filename
    with file_path.open("wb") as buffer:
        buffer.write(await file.read())

    text = extract_text_from_pdf(file_path)
    if not text:
        raise HTTPException(status_code=400, detail="PDF is empty or unreadable")

    chunks = chunk_text(text)
    embeddings = embedding_model.encode(chunks).tolist()
    ids = [str(uuid.uuid4()) for _ in chunks]

    
    collection = chroma_client.get_or_create_collection(name="pdf_collection")

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=[{"source": file.filename} for _ in chunks]

    )

    return {
        "message": f"'{file.filename}' processed successfully 🚀",
        "chunks_stored": len(chunks)
    }

# Helper for debug logging
def log_debug(msg):
    with open("debug_log.txt", "a") as f:
        f.write(f"{msg}\n")

@router.post("/ask")
async def ask_question(request: QuestionRequest, db: Session = Depends(database.get_db), token: str = Depends(auth.oauth2_scheme)):
    # Optional: Get current user if logged in (for history)
    current_user = None
    try:
        current_user = await auth.get_current_user(token, db)
    except:
        pass

    import logging
    logging.getLogger("transformers").setLevel(logging.ERROR)
    
    start_time = time.time()
    
    # 1. Personality & System Prompt
    ASTU_PERSONALITY = """
You are the CSEC_ASTU AI ASSISTANT.
- Provide CONCISE and DIRECT answers. 
- Do NOT start responses with "Hello! I am..." or similar introductions unless explicitly asked who you are.
- Prioritize information from the provided context.
- If the answer is in the document, state it immediately.
- If it's general knowledge, keep it brief and relevant to CSEC ASTU.
- Be professional and technical.
"""

    collection = chroma_client.get_or_create_collection(name="pdf_collection")
    context = ""
    confidence = 0.0
    retrieved_chunks = []
    sources = []

    try:
        # Step 2: Attempt to retrieve context (RAG)
        if collection.count() > 0:
            question_embedding = embed_text(request.question)
            results = collection.query(
                query_embeddings=[question_embedding],
                n_results=3,
                include=["documents","metadatas","distances"]
            )
            
            documents = results.get("documents")
            if documents and documents[0]:
                retrieved_chunks = documents[0]
                context = "\n\n".join(retrieved_chunks).strip()
                
                distances = results.get("distances", [])
                if distances and distances[0]:
                    confidence = 1 - min(distances[0])
                
                metadatas = results.get("metadatas", [])
                if metadatas and metadatas[0]:
                    for meta in metadatas[0]:
                        if meta and "source" in meta:
                            sources.append(meta["source"])

        # Step 3: Adaptive Prompt Engineering
        if context:
            prompt = f"""{ASTU_PERSONALITY}
Use the following context from an uploaded document to answer the question. 
If the answer is not in the context, but you know it because it's about ASTU or general knowledge, you may still answer but mention that it wasn't in the specific document.

Context:
{context}

Question:
{request.question}
"""
        else:
            prompt = f"""{ASTU_PERSONALITY}
Answer the following question directly.

Question:
{request.question}
"""

        # Step 4: Gemini Generation
        print(f"⏳ Calling Gemini API (Context: {'Yes' if context else 'No'})...")
        t_gen_start = time.time()
        try:
            response = generate_content_with_retry(
                model=GEMINI_MODEL,
                contents=prompt
            )
        except ResourceExhausted:
             return {
                 "answer": "⚠️ AI Service is currently busy. Please try again in 30 seconds.",
                 "sources": [],
                 "confidence_score": 0.0,
                 "chunks_used": 0,
                 "process_time": f"{time.time() - start_time:.2f}s (Failed)"
             }
        
        t_gen_end = time.time()
        
        # Save to database
        try:
            new_chat = models.ChatHistory(
                user_id=current_user.id if current_user else None,
                question=request.question,
                answer=response.text.strip()
            )
            db.add(new_chat)
            db.commit()
        except Exception as e:
            print(f"Error saving chat history: {e}")
            pass # Don't fail the request if history save fails

        return {
            "answer": response.text.strip(),
            "sources": list(set(sources)),
            "confidence_score": round(confidence, 3),
            "chunks_used": len(retrieved_chunks),
            "process_time": f"{t_gen_end - start_time:.2f}s"
        }

    except Exception as e:
        import traceback
        log_debug(f"ERROR: {e}")
        log_debug(traceback.format_exc())
        print(f"Error in /ask: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/history")
async def get_chat_history(current_user: models.User = Depends(auth.get_current_active_user), db: Session = Depends(database.get_db)):
    history = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == current_user.id).order_by(models.ChatHistory.timestamp.asc()).all()
    return history

@router.delete("/history")
async def clear_chat_history(current_user: models.User = Depends(auth.get_current_active_user), db: Session = Depends(database.get_db)):
    db.query(models.ChatHistory).filter(models.ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "History cleared"}
