# Design: Vision API Multipart Support

## Context
Web browsers send file uploads as `multipart/form-data`, not base64 JSON. The frontend camera capture uses FormData with `image` (Blob) and `query` (string) fields. The backend needs to accept this format to enable tongue diagnosis from the web UI.

**Current issue:**
- Frontend: `FormData.append('image', blob)` → `multipart/form-data`
- Backend: Expects `{"image": "data:image/jpeg;base64,...", "query": "..."}`
- Result: 500 Internal Server Error on `/v1/vision/analyze`

## Goals / Non-Goals

**Goals:**
- Accept multipart/form-data with file upload
- Maintain backward compatibility with base64 JSON format
- Reuse existing vision processing logic
- Return same JSON response format

**Non-Goals:**
- Streaming vision responses
- Multiple image uploads per request
- Image preprocessing/resizing (handled client-side)
- Authentication/rate limiting (add separately if needed)

## Decisions

### Decision 1: Support Both Multipart and JSON
**Rationale:** API should work for both web UI (multipart) and programmatic clients (base64 JSON)

**Implementation:**
- Use FastAPI's content negotiation
- Check `Content-Type` header or try multipart parsing first
- Fall back to JSON if multipart fails

**Alternative considered:** Remove base64 support → Rejected, breaks API compatibility

### Decision 2: Use FastAPI `File` and `Form`
**Rationale:** Built-in FastAPI dependencies handle multipart parsing cleanly

**Code pattern:**
```python
from fastapi import File, Form, UploadFile

@app.post("/v1/vision/analyze")
async def vision_analyze(
    image: UploadFile = File(...),
    query: str = Form("请从中医角度解读这张舌苔。")
):
    # Read image bytes
    image_data = await image.read()
    pil_image = Image.open(BytesIO(image_data))
    # ... rest of existing logic
```

**Alternative considered:** Manual multipart parsing → Too complex, reinvents FastAPI features

### Decision 3: Unified Response Format
**Rationale:** Frontend expects `{"diagnosis": "...", "success": true}` but backend returns `{"analysis": "..."}`

**Fix:** Align backend response keys with frontend expectations:
```python
return {
    "diagnosis": response_text,  # Changed from "analysis"
    "success": True,
    "model": "ShizhenGPT-32B-VL"
}
```

## Implementation Pattern

**Actual implementation (changed during development):**

Using `Request` object to manually parse multipart form avoids FastAPI validation issues with binary data:

```python
@app.post("/v1/vision/analyze")
async def vision_analyze(request: Request):
    """Analyze tongue image for TCM diagnosis via multipart/form-data"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    start_time = time.time()
    query_text = "请从中医角度解读这张舌苔。分析舌色、苔色、舌形、润燥等特征，并给出对应的中医证型和调理建议。"

    try:
        # Parse multipart form data manually
        form = await request.form()
        image_file = form.get("image")
        query_form = form.get("query")

        if not image_file:
            raise HTTPException(status_code=400, detail="No image provided")

        if query_form:
            query_text = str(query_form)

        # Handle image upload
        print(f"📸 Multipart upload: {image_file.filename}, {image_file.content_type}")
        image_data = await image_file.read()
        pil_image = Image.open(BytesIO(image_data))

        # ... existing vision processing logic ...

        return {
            "diagnosis": response_text,  # Changed from "analysis"
            "success": True,
            "model": "ShizhenGPT-32B-VL",
            "processing_time_seconds": round(elapsed, 2)
        }
```

**Why this approach:**
- FastAPI's `File()` and `Form()` caused `UnicodeDecodeError` when trying to encode validation errors with binary data
- Direct `Request.form()` parsing avoids the validation layer issue
- Simpler error handling without FastAPI trying to JSON-encode binary data

## Risks / Trade-offs

**Risk 1: Large image uploads causing timeout**
- **Mitigation:** Frontend already resizes to 1280x720 and compresses to JPEG 0.9 quality (~500KB-1MB)
- **Fallback:** Add request size limit in FastAPI (`max_body_size`)

**Risk 2: Memory usage with concurrent uploads**
- **Mitigation:** FastAPI handles uploads in streaming fashion, doesn't load entire file into memory
- **Monitor:** Track VRAM usage in `/health` endpoint

**Risk 3: Content-Type detection issues**
- **Mitigation:** Explicitly check for multipart in code, not just rely on headers
- **Validation:** Verify image is valid PIL-readable format

## Migration Plan

**⚠️ BREAKING CHANGE:** This ended up being a breaking change, not backward-compatible.
- Base64 JSON format removed (multipart/form-data only)
- Reason: FastAPI validation layer conflicts with binary data

**Actual rollout:**
1. ✅ Fixed environment variable ordering (HF_HOME before imports)
2. ✅ Cleaned /root/.cache to free disk space
3. ✅ Deployed backend with multipart support to RunPod
4. ✅ Updated frontend API route response parsing
5. ✅ Tested with curl and frontend proxy
6. ✅ Verified model loads from /workspace/models cache

**Performance metrics:**
- Model load time: ~2 minutes (cached from /workspace)
- Inference time: ~53 seconds per image
- VRAM usage: 66.91GB / 85.1GB (78.63%)

## Open Questions (RESOLVED)

1. Should we add image validation (max dimensions, format checking)?
   - **Answer:** ✅ Not for MVP, PIL handles most formats gracefully
2. Support multiple images per request?
   - **Answer:** ✅ No, keep single image per diagnosis for simplicity
3. Add request logging for debugging?
   - **Answer:** ✅ Yes, implemented - logs image size, format, and processing time
4. How to handle FastAPI validation errors with binary data?
   - **Answer:** ✅ Use `Request` object directly, parse form manually to bypass validation layer

## Lessons Learned

1. **Environment variables MUST be set before imports** - Setting `HF_HOME` after importing transformers has no effect
2. **FastAPI File() validation issues** - Binary data in validation errors causes `UnicodeDecodeError`, use `Request.form()` instead
3. **Disk space on RunPod** - Root overlay filesystem fills up, always use `/workspace` for large files
4. **Model caching** - 63GB model in /workspace/models reduces load time from 15-20min to ~2min
