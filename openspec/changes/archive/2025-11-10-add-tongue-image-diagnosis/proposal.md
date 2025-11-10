# Proposal: Add Tongue Image Diagnosis

## Why
Traditional Chinese Medicine relies heavily on tongue observation (舌诊/望诊). Users need to upload tongue photos for AI-powered TCM analysis. Adding image capture to the chat interface enables complete diagnostic workflows combining text symptoms and visual examination.

## What Changes
- Add camera capture button to chat UI
- Integrate browser MediaDevices API for photo capture
- Add file upload fallback for pre-existing images
- Send image + query "请从中医角度解读这张舌苔。" to backend `/v1/vision/analyze`
- Display tongue diagnosis in conversation thread
- Support both mobile camera and desktop webcam

## Impact
- **Affected specs**: `chat-ui` (modify existing capability)
- **Affected code**: Enhance `frontend/app/page.tsx` with image capture component
- **Dependencies**: Browser MediaDevices API (requires HTTPS or localhost)
- **Requires**: Both `model-inference` and `chat-ui` capabilities from previous changes
