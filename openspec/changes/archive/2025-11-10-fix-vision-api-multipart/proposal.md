# Proposal: Fix Vision API to Accept Multipart Form Data

## Why
The frontend tongue image capture sends images via `multipart/form-data` (standard for file uploads), but the backend `/v1/vision/analyze` endpoint expects base64-encoded JSON. This mismatch causes 500 errors when users try to analyze tongue images. Fixing this enables the complete tongue diagnosis workflow.

## What Changes
- Modify backend `/v1/vision/analyze` endpoint to accept `multipart/form-data` with `image` file and `query` text field
- Add FastAPI `File` and `Form` dependencies for multipart handling
- Convert uploaded file bytes to PIL Image (same internal processing)
- Maintain backward compatibility by supporting both base64 JSON (for API clients) and multipart (for web frontend)

## Impact
- **Affected specs**: `model-inference` (modify existing vision capability)
- **Affected code**:
  - `backend/server.py` - update `/v1/vision/analyze` endpoint
  - `frontend/app/api/vision/route.ts` - fix response parsing
- **Dependencies**: FastAPI `Request` import (changed from File/Form due to validation issues)
- **Breaking changes**: ⚠️ YES - Base64 JSON format removed, multipart only now

---

## Implementation Summary (POST-COMPLETION)

### Status: ✅ COMPLETED & DEPLOYED

### What Was Built
1. **Backend API** (`backend/server.py:201-306`)
   - Endpoint: `POST /v1/vision/analyze`
   - Accepts: `multipart/form-data` with `image` file and optional `query` text
   - Returns: `{diagnosis: string, success: boolean, model: string, processing_time_seconds: number}`
   - Uses `Request.form()` for manual parsing to avoid FastAPI validation issues

2. **Frontend Integration** (`frontend/app/api/vision/route.ts:36`)
   - Fixed response parsing from `data.analysis` to `data.diagnosis`
   - Proxies multipart uploads from browser to RunPod backend

3. **Infrastructure Fixes**
   - Moved `HF_HOME` environment variables before imports (critical fix)
   - Cleaned /root/.cache to free disk space (30GB overlay was 100% full)
   - Model cached in /workspace/models (63GB)

### Testing Results
- ✅ Backend curl test: Successful TCM diagnosis from input.jpeg
- ✅ Frontend API test: Correct response format and proxying
- ✅ Health check: Model loaded, 78.63% VRAM usage on A100
- ⏱️ Performance: ~53 seconds inference time per image

### Key Issues Resolved
1. **FastAPI UnicodeDecodeError**: Changed from `File()` params to `Request.form()` manual parsing
2. **Disk space**: Cleaned /root/.cache/huggingface, ensured model uses /workspace
3. **Environment variables**: Moved before imports to take effect
4. **Response format**: Aligned backend "diagnosis" with frontend expectations

### Deployment
- **Backend URL**: https://3wzca59jx2ytll-8000.proxy.runpod.net
- **Platform**: RunPod A100 80GB GPU
- **Status**: Live and healthy
- **Frontend**: http://localhost:3000 (ready for browser testing)
