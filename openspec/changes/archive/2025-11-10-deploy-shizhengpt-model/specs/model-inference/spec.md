# Model Inference Capability

## ADDED Requirements

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
The system SHALL accept tongue images and provide TCM interpretation (望诊).

#### Scenario: Tongue image analysis
- **WHEN** POST `/v1/vision/analyze` with multipart form containing `image` (PNG file) and `query` ("请从中医角度解读这张舌苔。")
- **THEN** return JSON with `{"diagnosis": "<TCM interpretation>", "image_received": true, "model_used": "ShizhenGPT-7B-VL"}`

#### Scenario: Unsupported image format
- **WHEN** POST `/v1/vision/analyze` with non-image file (e.g., .txt)
- **THEN** return status 415 with error "Unsupported media type"

#### Scenario: Missing query parameter
- **WHEN** POST `/v1/vision/analyze` with image but no `query` field
- **THEN** use default query "请从中医角度解读这张舌苔。"

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
