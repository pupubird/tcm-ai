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

**New endpoint signature:**
```python
@app.post("/v1/vision/analyze")
async def vision_analyze(
    image: UploadFile = File(None),          # Optional for multipart
    query: str = Form(default="请从中医角度解读这张舌苔。"),
    request_body: VisionRequest = None       # Optional for JSON
):
    # Handle multipart
    if image:
        image_data = await image.read()
        pil_image = Image.open(BytesIO(image_data))

    # Handle base64 JSON (backward compatibility)
    elif request_body and request_body.image:
        image_data = base64.b64decode(request_body.image.split(',')[-1])
        pil_image = Image.open(BytesIO(image_data))

    else:
        raise HTTPException(400, "No image provided")

    # ... existing vision processing logic ...
```

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

No migration needed - this is a backward-compatible addition. Existing base64 JSON clients continue working unchanged.

**Rollout:**
1. Deploy backend with multipart support
2. Test with frontend camera capture
3. Verify base64 JSON clients still work
4. Document both formats in API docs

## Open Questions

1. Should we add image validation (max dimensions, format checking)?
   - **Answer:** Not for MVP, PIL handles most formats gracefully
2. Support multiple images per request?
   - **Answer:** No, keep single image per diagnosis for simplicity
3. Add request logging for debugging?
   - **Answer:** Yes, log image size and format for monitoring
