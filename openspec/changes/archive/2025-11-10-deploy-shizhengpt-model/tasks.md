# Implementation Tasks

## 1. RunPod Setup
- [x] 1.1 Create RunPod account and add $30 credit
- [x] 1.2 Deploy A100 80GB instance with PyTorch template (Pod: troubled_gold_jackal)
- [x] 1.3 Create 100GB persistent volume for model storage
- [x] 1.4 Configure port 8000 exposure via RunPod proxy
- [x] 1.5 Note public HTTPS URL for frontend integration (`https://3wzca59jx2ytll-8000.proxy.runpod.net`)

## 2. Backend Code Development
- [x] 2.1 Create `backend/` directory with `server.py`
- [x] 2.2 Create `requirements.txt` with compatible versions (torch 2.8.0 pre-installed)
- [x] 2.3 Create deployment script for RunPod setup (`deploy_runpod.sh`)
- [x] 2.4 Add environment variable configuration (HF_HOME, TRANSFORMERS_CACHE, etc.)

## 3. Model Loading (32B)
- [x] 3.1 Implement model loader using `Qwen2_5_VLForConditionalGeneration`
- [x] 3.2 Configure for ShizhenGPT-32B-VL (not 7B)
- [x] 3.3 Set `device_map="auto"` with 75GB memory limit (reserve 5GB)
- [x] 3.4 Use FP16 precision for A100 deployment
- [x] 3.5 Configure HuggingFace cache to persistent volume `/workspace/models`

## 4. API Endpoints
- [x] 4.1 Implement `/health` with model status and VRAM usage
- [x] 4.2 Implement `/v1/chat/completions` (text inference)
- [x] 4.3 Implement `/v1/vision/analyze` (image + text multimodal)
- [x] 4.4 Implement `/v1/models` to list loaded model
- [x] 4.5 Add CORS middleware for frontend access

## 5. RunPod Deployment
- [x] 5.1 SSH into RunPod instance (root@38.128.232.104:35654)
- [x] 5.2 Install dependencies via pip (--break-system-packages flag)
- [x] 5.3 Upload or clone backend code (uploaded via scp)
- [x] 5.4 Download ShizhenGPT-32B-VL to persistent volume (COMPLETED: 64GB downloaded)
- [x] 5.5 Start uvicorn server with nohup for persistent running
- [x] 5.6 Fix disk space issue (created start_server.sh with proper env vars)

## 6. Testing & Validation
- [x] 6.1 Test `/health` endpoint returns 200 with model_loaded=true ✓
- [x] 6.2 Test text query: "手脚冰凉，经常怕冷，是什么原因？" ✓ (TCM diagnosis working)
- [ ] 6.3 Test tongue image analysis with sample image (pending: need sample image)
- [x] 6.4 Verify response latency (text queries working, ~2-3s observed)
- [x] 6.5 Monitor VRAM usage (66.91GB allocated / 85.1GB total = 78.63% utilization)

## 7. Frontend Integration
- [ ] 7.1 Update `frontend/.env.local` with RunPod public URL
- [ ] 7.2 Test chat interface connects to RunPod backend
- [ ] 7.3 Verify streaming responses work over HTTPS
- [ ] 7.4 Test image upload from frontend to RunPod

## 8. Documentation
- [x] 8.1 Create `backend/README.md` with RunPod deployment guide
- [x] 8.2 Document API endpoints with curl examples
- [x] 8.3 Add cost breakdown (hourly/daily rates)
- [x] 8.4 Document how to stop/restart RunPod instance
- [x] 8.5 Add troubleshooting guide (OOM errors, connection issues)
- [x] 8.6 Create `backend/DEPLOYMENT.md` with manual deployment steps
- [x] 8.7 Create `backend/monitor.sh` script for server monitoring
