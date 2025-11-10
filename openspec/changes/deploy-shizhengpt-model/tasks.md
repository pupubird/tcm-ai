# Implementation Tasks

## 1. RunPod Setup
- [ ] 1.1 Create RunPod account and add $30 credit
- [ ] 1.2 Deploy A100 80GB instance with PyTorch template
- [ ] 1.3 Create 100GB persistent volume for model storage
- [ ] 1.4 Configure port 8000 exposure via RunPod proxy
- [ ] 1.5 Note public HTTPS URL for frontend integration

## 2. Backend Code Development
- [ ] 2.1 Create `backend/` directory with `server.py`
- [ ] 2.2 Create `requirements.txt` with pinned versions
- [ ] 2.3 Create deployment script for RunPod setup
- [ ] 2.4 Add environment variable configuration

## 3. Model Loading (32B)
- [ ] 3.1 Implement model loader using `Qwen2_5_VLForConditionalGeneration`
- [ ] 3.2 Configure for ShizhenGPT-32B-VL (not 7B)
- [ ] 3.3 Set `device_map="auto"` with 75GB memory limit (reserve 5GB)
- [ ] 3.4 Use FP16 precision for A100 deployment
- [ ] 3.5 Configure HuggingFace cache to persistent volume `/workspace/models`

## 4. API Endpoints
- [ ] 4.1 Implement `/health` with model status and VRAM usage
- [ ] 4.2 Implement `/v1/chat/completions` (text inference)
- [ ] 4.3 Implement `/v1/vision/analyze` (image + text multimodal)
- [ ] 4.4 Implement `/v1/models` to list loaded model
- [ ] 4.5 Add CORS middleware for frontend access

## 5. RunPod Deployment
- [ ] 5.1 SSH into RunPod instance
- [ ] 5.2 Install dependencies via pip
- [ ] 5.3 Upload or clone backend code
- [ ] 5.4 Download ShizhenGPT-32B-VL to persistent volume (first run: 15-20 min)
- [ ] 5.5 Start uvicorn server with nohup for persistent running

## 6. Testing & Validation
- [ ] 6.1 Test `/health` endpoint returns 200 with model_loaded=true
- [ ] 6.2 Test text query: "手脚冰凉，经常怕冷，是什么原因？"
- [ ] 6.3 Test tongue image analysis with sample image
- [ ] 6.4 Verify response latency (1-3s for text, 3-6s for vision)
- [ ] 6.5 Monitor VRAM usage (should be ~70-75GB on A100)

## 7. Frontend Integration
- [ ] 7.1 Update `frontend/.env.local` with RunPod public URL
- [ ] 7.2 Test chat interface connects to RunPod backend
- [ ] 7.3 Verify streaming responses work over HTTPS
- [ ] 7.4 Test image upload from frontend to RunPod

## 8. Documentation
- [ ] 8.1 Create `backend/README.md` with RunPod deployment guide
- [ ] 8.2 Document API endpoints with curl examples
- [ ] 8.3 Add cost breakdown (hourly/daily rates)
- [ ] 8.4 Document how to stop/restart RunPod instance
- [ ] 8.5 Add troubleshooting guide (OOM errors, connection issues)
