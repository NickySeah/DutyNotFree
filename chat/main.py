import torch
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import faiss
import numpy as np
import os
import pickle
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Global variables for models (will be loaded at startup)
embed_model = None
generator = None
tokenizer = None
chunks = None
index = None

# Check GPU availability
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
if device == "cuda":
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

def chunk_text(text, chunk_size=1000):
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

def save_embeddings(chunk_embeddings, faiss_index, text_chunks):
    np.save('chunk_embeddings.npy', chunk_embeddings)
    with open('chunks.pkl', 'wb') as f:
        pickle.dump(text_chunks, f)
    faiss.write_index(faiss_index, 'faiss_index.index')

def load_models():
    global embed_model, generator, tokenizer, chunks, index
    
    # Load embedding model
    embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device=device)
    
    embedding_path = 'chunk_embeddings.npy'
    chunks_path = 'chunks.pkl'
    index_path = 'faiss_index.index'

    # Load or compute embeddings
    if os.path.exists(embedding_path) and os.path.exists(chunks_path) and os.path.exists(index_path):
        try:
            chunk_embeddings = np.load(embedding_path)
            with open(chunks_path, 'rb') as f:
                chunks = pickle.load(f)
            index = faiss.read_index(index_path)
            print("Loaded embeddings and index from saved files.")
        except Exception as e:
            print(f"Failed to load saved artifacts ({e}), recomputing embeddings...")
            compute_embeddings()
    else:
        compute_embeddings()

    # Load language model
    model_id = "microsoft/Phi-4-mini-instruct"
    print(f"\nLoading {model_id} on {device}...")
    tokenizer = AutoTokenizer.from_pretrained(model_id)

    if device == "cuda":
        model = AutoModelForCausalLM.from_pretrained(
            model_id, 
            dtype=torch.float16,
            device_map="auto",
            low_cpu_mem_usage=True
        )
    else:
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            dtype=torch.float32,
            device_map="cpu"
        )

    generator = pipeline(
        "text-generation", 
        model=model, 
        tokenizer=tokenizer
    )

    print(f"Model loaded successfully on {device}\n")

def compute_embeddings():
    global chunks, index
    
    print("Computing embeddings from PDF...")
    reader = PdfReader("stcced2022.pdf")
    text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    print(f"Extracted {len(text)} characters from PDF.")
    
    chunks = chunk_text(text)
    print(f"Computing embeddings for {len(chunks)} chunks on {device}...")
    chunk_embeddings = embed_model.encode(chunks, show_progress_bar=True)
    chunk_embeddings = np.array(chunk_embeddings).astype('float32')
    index = faiss.IndexFlatL2(chunk_embeddings.shape[1])
    index.add(chunk_embeddings)
    save_embeddings(chunk_embeddings, index, chunks)
    print("Computed embeddings and saved them.")

def retrieve_context(query, k=3):
    query_embedding = embed_model.encode([query]).astype('float32')
    D, I = index.search(query_embedding, k)
    return " ".join([chunks[i] for i in I[0]])

def classify_product(query: str) -> Dict[str, Any]:
    context = retrieve_context(query)
    
    prompt_text = f"""<|system|>
You are an expert customs tariff classification assistant.
Based on the given context and question, identify and list the top 3 most likely HS codes.

You must respond ONLY with valid JSON in the following format (no additional text):
{{
  "query": "the product name",
  "hs_codes": [
    {{
      "type_of_product": "category",
      "hs_code": "code",
      "hs_description": "description"
    }},
    {{
      "type_of_product": "category",
      "hs_code": "code",
      "hs_description": "description"
    }},
    {{
      "type_of_product": "category",
      "hs_code": "code",
      "hs_description": "description"
    }}
  ]
}}

Return ONLY the JSON object, nothing else.<|end|>
<|user|>
Context:
{context}

Question:
{query}<|end|>
<|assistant|>
"""

    response = generator(
        prompt_text,
        max_new_tokens=500,
        top_k=10,
        repetition_penalty=1.1,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )

    generated_text = response[0]["generated_text"]
    
    if "<|assistant|>" in generated_text:
        answer = generated_text.split("<|assistant|>")[-1].strip()
    else:
        answer = generated_text.strip()
    
    try:
        start = answer.find('{')
        end = answer.rfind('}') + 1
        if start != -1 and end > start:
            json_str = answer[start:end]
            parsed_json = json.loads(json_str)
            return parsed_json
        else:
            return {"error": "No valid JSON found", "raw_text": answer}
    except json.JSONDecodeError as e:
        return {"error": f"JSON parsing failed: {str(e)}", "raw_text": answer}

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Loading models...")
    load_models()
    print("API ready!")
    yield
    # Shutdown (optional cleanup code can go here)
    print("Shutting down...")

# Pydantic models for request/response
class QueryRequest(BaseModel):
    query: str

class BatchQueryRequest(BaseModel):
    queries: List[str]

class HSCodeResponse(BaseModel):
    type_of_product: str
    hs_code: str
    hs_description: str

class ClassificationResponse(BaseModel):
    query: str
    hs_codes: List[HSCodeResponse]

class BatchClassificationResponse(BaseModel):
    results: List[Dict[str, Any]]

# Initialize FastAPI app with lifespan
app = FastAPI(title="HS Code Classification API", version="1.0.0", lifespan=lifespan)

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "device": device}

# Single query endpoint
@app.post("/classify", response_model=Dict[str, Any])
async def classify_single(request: QueryRequest):
    try:
        result = classify_product(request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Batch query endpoint
@app.post("/classify-batch", response_model=BatchClassificationResponse)
async def classify_batch(request: BatchQueryRequest):
    try:
        results = []
        for query in request.queries:
            result = classify_product(query)
            results.append(result)
        return BatchClassificationResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get available device info
@app.get("/device-info")
async def get_device_info():
    info = {"device": device}
    if device == "cuda":
        info["gpu_name"] = torch.cuda.get_device_name(0)
        info["gpu_memory"] = f"{torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB"
    return info

if __name__ == "__main__":
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8000)