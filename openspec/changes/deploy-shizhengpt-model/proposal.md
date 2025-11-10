# Proposal: Deploy ShizhenGPT Model on RunPod

## Why
The project needs a foundation for Traditional Chinese Medicine AI diagnosis. ShizhenGPT-32B-VL (based on Qwen2.5-VL) provides TCM-specific training for text and vision-based medical consultations. Deploying on RunPod A100 80GB provides necessary VRAM for the 32B model while maintaining reasonable cost (~$1.19/hr).

## What Changes
- Add Python FastAPI server wrapping ShizhenGPT-32B-VL model
- Deploy on RunPod A100 80GB GPU instance
- Expose OpenAI-compatible `/v1/chat/completions` endpoint for text queries
- Expose `/v1/vision/analyze` endpoint for tongue image diagnosis
- Provide health check and model management endpoints
- Use RunPod persistent volume for model caching (avoid re-downloading 64GB)
- Configure public HTTPS endpoint via RunPod proxy

## Impact
- **Affected specs**: `model-inference` (new capability)
- **Affected code**: New Python server in `backend/` directory
- **Dependencies**: `transformers`, `torch`, `qwen-vl-utils`, `fastapi`, `uvicorn`, `accelerate`
- **Hardware**: RunPod A100 80GB (~$1.19/hr = $28.56/day)
- **Storage**: 100GB persistent volume for model weights (~$2/month)
