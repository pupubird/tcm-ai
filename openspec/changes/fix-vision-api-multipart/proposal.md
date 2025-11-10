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
- **Affected code**: `backend/server.py` - update `/v1/vision/analyze` endpoint
- **Dependencies**: FastAPI `File`, `Form`, `UploadFile` imports
- **Breaking changes**: None - adds multipart support while keeping base64 support
