# Spec Delta: model-inference

## MODIFIED Requirements

### Requirement: Vision Analysis API
The system SHALL accept tongue images via multipart form upload or base64 JSON.

#### Scenario: Multipart file upload
- **WHEN** client sends POST to `/v1/vision/analyze` with `Content-Type: multipart/form-data`
- **AND** includes `image` file field and `query` text field
- **THEN** system processes image and returns TCM diagnosis in JSON

#### Scenario: Base64 JSON upload (backward compatibility)
- **WHEN** client sends POST to `/v1/vision/analyze` with `Content-Type: application/json`
- **AND** includes `{"image": "data:image/jpeg;base64,...", "query": "..."}`
- **THEN** system processes image and returns same diagnosis format

#### Scenario: Missing image error
- **WHEN** client sends request without image in either format
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

## ADDED Requirements

### Requirement: Request Format Logging
The system SHALL log image upload details for debugging.

#### Scenario: Log multipart uploads
- **WHEN** multipart image is received
- **THEN** log: image filename, size (bytes), content type, query text

#### Scenario: Log base64 uploads
- **WHEN** base64 image is received
- **THEN** log: decoded image size, format detected by PIL

#### Scenario: Log inference timing
- **WHEN** vision analysis completes
- **THEN** log: processing time (seconds), VRAM usage before/after
