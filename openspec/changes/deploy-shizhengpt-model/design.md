# Design: ShizhenGPT Model Deployment on RunPod

## Context
ShizhenGPT is a Qwen2.5-based model fine-tuned for Traditional Chinese Medicine. The 32B-VL variant supports both text and vision inputs (tongue diagnosis images) with superior diagnostic accuracy compared to 7B. RunPod A100 80GB provides necessary VRAM (~75GB) for the 32B model at competitive pricing ($1.19/hr).

**Constraints:**
- Model size: ~64GB on disk
- VRAM required: ~70-75GB (32B parameters + inference overhead)
- Inference latency: 1-3s per text query, 3-6s per image (A100 GPU)
- RunPod public endpoint requires HTTPS/CORS configuration

## Goals / Non-Goals

**Goals:**
- Deploy ShizhenGPT-32B-VL on RunPod A100 80GB
- Provide REST API compatible with OpenAI client libraries
- Support both text consultation and tongue image analysis
- Use persistent volume to avoid re-downloading 64GB model
- Expose public HTTPS endpoint via RunPod proxy

**Non-Goals:**
- Model quantization (use full FP16 precision)
- Multi-user authentication (trust frontend origin)
- Conversation history persistence (stateless API)
- Streaming responses (blocking inference for simplicity)
- Local/MacBook deployment (32B won't fit)

## Decisions

### Decision 1: RunPod over Vast.ai/Lambda/DigitalOcean
**Rationale:** Best balance of cost, UX, and reliability

**Comparison:**
- **RunPod A100 80GB:** $1.19/hr, best UX, persistent volumes, auto-exposed HTTPS
- **Vast.ai A100 80GB:** $1.20-1.80/hr, marketplace variability, manual SSH setup
- **Lambda Labs A100 80GB:** $1.76/hr, often out of stock, waitlist required
- **DigitalOcean H200:** $3.44/hr, 3x more expensive, overkill specs

**Winner: RunPod** (easiest setup + competitive pricing)

### Decision 2: ShizhenGPT-32B-VL (Not 7B)
**Rationale:** Superior diagnostic accuracy justifies cost

**Comparison:**
- **7B model:** RTX 4090 @ $0.30/hr, faster responses (2-5s), lower accuracy
- **32B model:** A100 80GB @ $1.19/hr, 1-3s responses, 2-3x better TCM accuracy

**Trade-off:** 4x cost increase for professional-grade diagnosis quality

### Decision 3: FP16 Precision (Not Quantization)
**Rationale:** A100 has 80GB VRAM, no need to sacrifice quality

**Alternatives considered:**
- **4-bit quantization:** Reduces to ~20GB but degrades diagnosis accuracy
- **8-bit quantization:** Reduces to ~40GB, minimal quality loss
- **FP16 (chosen):** Full ~70GB, maximum accuracy

### Decision 4: FastAPI over Gradio
**Rationale:** API-first design, OpenAI compatibility, CORS control

**Alternatives considered:**
- **Gradio:** UI-focused, harder to integrate with custom frontend
- **Flask:** Manual async handling, no auto-docs
- **FastAPI (chosen):** Async native, OpenAPI docs, Pydantic validation

### Decision 5: Persistent Volume for Model Caching
**Rationale:** Avoid re-downloading 64GB on every restart

**Implementation:**
- Create 100GB RunPod volume → mount to `/workspace`
- Set `HF_HOME=/workspace/models` for HuggingFace cache
- First download: 15-20 min, subsequent starts: 2-3 min

**Cost:** ~$2/month storage vs ~$0.50/restart in wasted download time

## Implementation Pattern

### File Structure
```
backend/
├── server.py              # FastAPI app (32B-specific config)
├── requirements.txt       # Python dependencies
├── deploy_runpod.sh       # Deployment automation script
├── README.md              # RunPod setup guide
└── .env.example           # Environment template
```

### RunPod Configuration
```yaml
GPU: A100 80GB PCIe
Template: RunPod PyTorch 2.1
Container Disk: 50GB (temporary)
Volume: 100GB (persistent, mounted to /workspace)
Exposed Ports: 8000 (auto-proxied to HTTPS)
Environment:
  HF_HOME: /workspace/models
  TRANSFORMERS_CACHE: /workspace/models
```

### Model Loading (32B-Specific)
```python
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
import torch
import os

# Use persistent volume for model cache
os.environ['HF_HOME'] = '/workspace/models'
os.environ['TRANSFORMERS_CACHE'] = '/workspace/models'

model = None
processor = None

@app.on_event("startup")
async def load_model():
    global model, processor

    processor = AutoProcessor.from_pretrained("FreedomIntelligence/ShizhenGPT-32B-VL")
    model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
        "FreedomIntelligence/ShizhenGPT-32B-VL",
        torch_dtype=torch.float16,      # FP16 for A100
        device_map="auto",              # Auto-distribute across GPU
        max_memory={0: "75GB"}          # Reserve 5GB for inference overhead
    )

    print(f"✓ Model loaded on {model.device}")
    print(f"✓ VRAM used: {torch.cuda.max_memory_allocated()/1e9:.2f}GB")
```

### CORS Configuration (for Frontend)
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Risks / Trade-offs

### Risk 1: Model download failure (64GB)
- **Mitigation:** Use persistent volume, retry logic with exponential backoff, monitor HuggingFace status
- **Recovery:** If download corrupted, delete `/workspace/models` cache and restart

### Risk 2: OOM despite 80GB VRAM
- **Mitigation:** Set `max_memory={0: "75GB"}` to reserve buffer, monitor with `nvidia-smi`
- **Fallback:** If OOM occurs, reduce `max_new_tokens` from 2048 → 1024

### Risk 3: RunPod instance unexpected shutdown
- **Mitigation:** Use persistent volume (model survives), set up monitoring/alerts
- **Recovery:** Restart pod via dashboard, server auto-starts with cached model (2-3 min)

### Risk 4: High inference latency on complex queries
- **Expected:** Text: 1-3s, Vision: 3-6s (acceptable for medical diagnosis)
- **Mitigation:** Display loading indicators in frontend, set frontend timeout to 30s

### Risk 5: Cost overrun
- **Current:** $1.19/hr = $28.56/day = $857/month if left running
- **Mitigation:** Stop instance when not in use, set up budget alerts on RunPod dashboard
- **Best practice:** Run 8hrs/day during testing ($9.52/day), scale to 24/7 only for production

## Migration Plan

### From Local MacBook (if previously attempted)
1. MacBook can't run 32B model (OOM)
2. No migration needed, RunPod is first viable deployment

### From 7B to 32B (if downgrading later)
1. Change model name in `server.py`: `ShizhenGPT-32B-VL` → `ShizhenGPT-7B-VL`
2. Switch to cheaper GPU: A100 80GB → RTX 4090 24GB
3. Adjust `max_memory` setting: `75GB` → `20GB`

## Deployment Steps Summary

1. **RunPod Setup:** Create account, add credit, deploy A100 80GB pod
2. **Volume Creation:** Create 100GB volume, mount to `/workspace`
3. **Code Upload:** Clone repo or upload `server.py` to pod
4. **Dependencies:** `pip install -r requirements.txt`
5. **Model Download:** First run downloads 64GB to persistent volume (15-20 min)
6. **Server Start:** `nohup uvicorn server:app --host 0.0.0.0 --port 8000 &`
7. **Frontend Config:** Update `.env.local` with RunPod HTTPS URL

## Cost Breakdown

**Testing Phase (8hrs/day, 2 weeks):**
- GPU: 8hrs × 14 days × $1.19/hr = **$133.28**
- Storage: 100GB × $0.02/GB/month × 0.5 month = **$1.00**
- **Total testing: $134.28**

**Production (24/7, 1 month):**
- GPU: 720hrs × $1.19/hr = **$856.80**
- Storage: 100GB × $0.02/GB/month = **$2.00**
- **Total monthly: $858.80**

**Alternative (stop at night, 12hrs/day):**
- GPU: 360hrs × $1.19/hr = **$428.40**
- Storage: **$2.00**
- **Total: $430.40/month** (50% savings)

## Open Questions

1. **Should we add authentication for public HTTPS endpoint?**
   - **Answer:** Not for MVP (trust frontend), add JWT in production if exposing publicly

2. **Rate limiting to prevent abuse?**
   - **Answer:** Not needed for MVP (single-user testing), add Redis-based rate limiting for production

3. **Automatic instance shutdown after inactivity?**
   - **Answer:** Manual shutdown for MVP, automate with RunPod API + cron job later

4. **Backup to cheaper GPU during low-traffic hours?**
   - **Answer:** No, complexity not worth savings for MVP, revisit for production cost optimization
