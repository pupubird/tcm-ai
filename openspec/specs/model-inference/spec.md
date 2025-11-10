# model-inference Specification

## Purpose
TBD - created by archiving change deploy-shizhengpt-model. Update Purpose after archive.
## Requirements
### Requirement: Health Check
The system SHALL provide a health check endpoint to verify model readiness.

#### Scenario: Model loaded successfully
- **WHEN** GET `/health` is called
- **THEN** return status 200 with `{"status": "healthy", "model_loaded": true, "model_name": "ShizhenGPT-7B-VL", "device": "cuda:0"}`

#### Scenario: Model not yet loaded
- **WHEN** GET `/health` is called before first inference
- **THEN** return status 200 with `{"status": "healthy", "model_loaded": false}`

### Requirement: Text-Based TCM Consultation
The system SHALL accept text queries and return Traditional Chinese Medicine diagnosis using ShizhenGPT.

#### Scenario: Simple symptom query
- **WHEN** POST `/v1/chat/completions` with `{"messages": [{"role": "user", "content": "为什么我总是手脚冰凉？"}], "max_tokens": 2048}`
- **THEN** return OpenAI-compatible response with TCM analysis in `choices[0].message.content`

#### Scenario: Multi-turn conversation
- **WHEN** POST `/v1/chat/completions` with messages array containing previous assistant responses
- **THEN** process conversation context and return contextual diagnosis

#### Scenario: Invalid request format
- **WHEN** POST `/v1/chat/completions` with missing `messages` field
- **THEN** return status 400 with error message

### Requirement: Vision-Based Tongue Diagnosis
The system SHALL accept tongue images via multipart form upload.

#### Scenario: Multipart file upload
- **WHEN** client sends POST to `/v1/vision/analyze` with `Content-Type: multipart/form-data`
- **AND** includes `image` file field and optional `query` text field
- **THEN** system processes image and returns TCM diagnosis in JSON

#### Scenario: Missing image error
- **WHEN** client sends request without image
- **THEN** system returns 400 Bad Request with error "No image provided"

#### Scenario: Invalid image format
- **WHEN** client uploads non-image file (e.g., text, PDF)
- **THEN** system returns 415 Unsupported Media Type with error "Invalid image format"

#### Scenario: Diagnosis response format
- **WHEN** vision analysis completes successfully
- **THEN** system returns JSON: `{"diagnosis": "<TCM analysis text>", "success": true, "model": "ShizhenGPT-32B-VL"}`

#### Scenario: Large image handling
- **WHEN** client uploads image >10MB
- **THEN** system returns 413 Request Entity Too Large (FastAPI default limit)

#### Scenario: Vision inference timeout
- **WHEN** model processing exceeds 60 seconds
- **THEN** system returns 504 Gateway Timeout

### Requirement: Model Information
The system SHALL expose loaded model metadata.

#### Scenario: List available models
- **WHEN** GET `/v1/models`
- **THEN** return JSON array with `{"data": [{"id": "ShizhenGPT-7B-VL", "object": "model", "owned_by": "FreedomIntelligence", "capabilities": ["text", "vision"]}]}`

### Requirement: Device Fallback
The system SHALL automatically select GPU or CPU based on availability.

#### Scenario: GPU available
- **WHEN** server starts with CUDA-capable GPU
- **THEN** load model to GPU and log "Model loaded on cuda:0"

#### Scenario: GPU unavailable
- **WHEN** server starts without GPU
- **THEN** load model to CPU and log "Model loaded on CPU (GPU not available)"

### Requirement: Error Handling
The system SHALL provide clear error messages for inference failures.

#### Scenario: Model inference timeout
- **WHEN** inference takes >60 seconds
- **THEN** return status 500 with error "Inference timeout exceeded"

#### Scenario: Out of memory error
- **WHEN** model fails to load due to insufficient memory
- **THEN** log error and return status 500 with "Insufficient memory to load model"

### Requirement: Request Format Logging
The system SHALL log image upload details for debugging.

#### Scenario: Log multipart uploads
- **WHEN** multipart image is received
- **THEN** log: image filename, size (bytes), content type, PIL format and dimensions

#### Scenario: Log inference timing
- **WHEN** vision analysis completes
- **THEN** log: processing time (seconds), VRAM usage before/after

