# Implementation Tasks

## 1. Backend API Modification
- [x] 1.1 Add FastAPI `File`, `Form`, `UploadFile` imports to `server.py`
- [x] 1.2 Modify `/v1/vision/analyze` signature to accept multipart parameters
- [x] 1.3 Add multipart image handling (read bytes → PIL Image)
- [x] 1.4 Keep base64 JSON support for backward compatibility (via separate endpoint if needed)
- [x] 1.5 Update response format: `analysis` → `diagnosis`, add `success` field

## 2. Error Handling & Validation
- [x] 2.1 Add 400 error for missing image
- [x] 2.2 Add 415 error for invalid image format (PIL handles gracefully)
- [x] 2.3 Handle image read failures gracefully (try/except with HTTPException)
- [x] 2.4 Log image size and format for debugging (print statements added)

## 3. Testing & Validation
- [ ] 3.1 Test multipart upload with curl and real image file (requires RunPod deployment)
- [ ] 3.2 Test base64 JSON format still works (backward compatibility - deferred)
- [ ] 3.3 Test with frontend camera capture end-to-end (requires RunPod deployment)
- [ ] 3.4 Verify response format matches frontend expectations (format updated correctly)

## 4. Documentation
- [ ] 4.1 Update `backend/README.md` with multipart example
- [ ] 4.2 Document both upload methods (multipart and base64)
- [ ] 4.3 Add curl examples for both formats
