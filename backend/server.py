"""
ShizhenGPT-32B-VL FastAPI Server
Deploys Traditional Chinese Medicine AI model on RunPod A100 80GB
"""
import os

# Configure model cache to persistent volume
# MUST be set before importing transformers
os.environ['HF_HOME'] = '/workspace/models'
os.environ['TRANSFORMERS_CACHE'] = '/workspace/models'
os.environ['HF_HUB_CACHE'] = '/workspace/models'
os.environ['HUGGINGFACE_HUB_CACHE'] = '/workspace/models'

# Create cache directory
os.makedirs('/workspace/models', exist_ok=True)

import torch
from fastapi import FastAPI, HTTPException, File, Form, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info
import base64
from io import BytesIO
from PIL import Image
import time

app = FastAPI(title="ShizhenGPT API", version="1.0.0")

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
model = None
processor = None
model_loaded = False

class ChatRequest(BaseModel):
    messages: List[dict]
    max_tokens: Optional[int] = 2048
    temperature: Optional[float] = 0.7

class VisionRequest(BaseModel):
    image: str  # base64 encoded image
    question: Optional[str] = "请从中医角度解读这张舌苔。"
    max_tokens: Optional[int] = 2048

@app.on_event("startup")
async def load_model():
    """Load ShizhenGPT-32B-VL model on startup"""
    global model, processor, model_loaded

    try:
        print("🚀 Loading ShizhenGPT-32B-VL model...")
        print(f"   Cache directory: {os.environ['HF_HOME']}")

        # Load processor
        processor = AutoProcessor.from_pretrained(
            "FreedomIntelligence/ShizhenGPT-32B-VL",
            trust_remote_code=True
        )

        # Load model with A100-optimized settings
        model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            "FreedomIntelligence/ShizhenGPT-32B-VL",
            torch_dtype=torch.float16,      # FP16 for A100
            device_map="auto",              # Auto-distribute across GPU
            max_memory={0: "75GB"},         # Reserve 5GB for inference overhead
            trust_remote_code=True
        )

        model_loaded = True

        # Print diagnostics
        print(f"✓ Model loaded successfully")
        print(f"✓ Device: {model.device}")
        print(f"✓ VRAM allocated: {torch.cuda.memory_allocated(0)/1e9:.2f} GB")
        print(f"✓ VRAM reserved: {torch.cuda.memory_reserved(0)/1e9:.2f} GB")

    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        model_loaded = False
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "ShizhenGPT-32B-VL API",
        "status": "running",
        "model_loaded": model_loaded
    }

@app.get("/health")
async def health_check():
    """Health check with model status and VRAM usage"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    vram_allocated = torch.cuda.memory_allocated(0) / 1e9
    vram_reserved = torch.cuda.memory_reserved(0) / 1e9
    vram_total = torch.cuda.get_device_properties(0).total_memory / 1e9

    return {
        "status": "healthy",
        "model_loaded": model_loaded,
        "model_name": "ShizhenGPT-32B-VL",
        "device": str(model.device) if model else None,
        "vram": {
            "allocated_gb": round(vram_allocated, 2),
            "reserved_gb": round(vram_reserved, 2),
            "total_gb": round(vram_total, 2),
            "utilization_percent": round((vram_allocated / vram_total) * 100, 2)
        }
    }

@app.get("/v1/models")
async def list_models():
    """List loaded models (OpenAI-compatible endpoint)"""
    if not model_loaded:
        return {"data": []}

    return {
        "data": [{
            "id": "ShizhenGPT-32B-VL",
            "object": "model",
            "owned_by": "FreedomIntelligence",
            "permission": []
        }]
    }

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatRequest):
    """
    OpenAI-compatible chat completions endpoint for text queries
    Example: 手脚冰凉，经常怕冷，是什么原因？
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Convert messages to Qwen format
        messages = request.messages

        # Apply chat template
        text = processor.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        # Prepare inputs
        inputs = processor(
            text=[text],
            return_tensors="pt",
            padding=True
        ).to(model.device)

        # Generate response
        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                do_sample=True if request.temperature > 0 else False
            )

        # Decode response
        generated_ids = [
            output_ids[i][len(inputs.input_ids[i]):]
            for i in range(len(output_ids))
        ]
        response_text = processor.batch_decode(
            generated_ids,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False
        )[0]

        return {
            "id": "chatcmpl-shizhengpt",
            "object": "chat.completion",
            "model": "ShizhenGPT-32B-VL",
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": response_text
                },
                "finish_reason": "stop"
            }]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/v1/vision/analyze")
async def vision_analyze(request: Request):
    """
    Analyze tongue image for TCM diagnosis via multipart/form-data

    Multipart format:
        - image: file upload (required)
        - query: text field (optional)
    """
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    start_time = time.time()
    pil_image = None
    query_text = "请从中医角度解读这张舌苔。分析舌色、苔色、舌形、润燥等特征，并给出对应的中医证型和调理建议。"

    try:
        # Parse multipart form data
        form = await request.form()
        image_file = form.get("image")
        query_form = form.get("query")

        if not image_file:
            raise HTTPException(status_code=400, detail="No image provided")

        if query_form:
            query_text = str(query_form)

        # Handle multipart upload
        print(f"📸 Multipart upload: {image_file.filename}, {image_file.content_type}")
        image_data = await image_file.read()
        print(f"   Image size: {len(image_data)} bytes")
        pil_image = Image.open(BytesIO(image_data))
        print(f"   PIL format: {pil_image.format}, size: {pil_image.size}")

        # Prepare multimodal messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": pil_image},
                    {"type": "text", "text": query_text}
                ]
            }
        ]

        # Apply chat template
        text = processor.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        # Process vision info
        image_inputs, video_inputs = process_vision_info(messages)

        # Prepare inputs
        inputs = processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            return_tensors="pt",
            padding=True
        ).to(model.device)

        # Generate response
        print(f"🧠 Running inference...")
        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=2048,
                temperature=0.7,
                do_sample=True
            )

        # Decode response
        generated_ids = [
            output_ids[i][len(inputs.input_ids[i]):]
            for i in range(len(output_ids))
        ]
        response_text = processor.batch_decode(
            generated_ids,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False
        )[0]

        elapsed = time.time() - start_time
        print(f"✓ Vision analysis complete in {elapsed:.1f}s")
        print(f"   Response length: {len(response_text)} chars")

        # Return format matching frontend expectations
        return {
            "diagnosis": response_text,
            "success": True,
            "model": "ShizhenGPT-32B-VL",
            "processing_time_seconds": round(elapsed, 2)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Vision analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vision analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
