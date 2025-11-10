# Implementation Tasks

## 1. Camera Capture Component
- [x] 1.1 Create `components/CameraCapture.tsx` using MediaDevices API
- [x] 1.2 Add video preview element showing live camera feed
- [x] 1.3 Implement canvas-based photo capture (convert to blob)
- [x] 1.4 Add "Capture" and "Retake" buttons
- [x] 1.5 Handle camera permission requests and denials

## 2. File Upload Fallback
- [ ] 2.1 Add file input accepting `image/png,image/jpeg,image/webp`
- [ ] 2.2 Validate file size (max 10MB)
- [ ] 2.3 Display image preview before submission
- [ ] 2.4 Add "Remove image" button to clear selection
Note: File upload fallback deferred - camera capture is primary method

## 3. Backend API Integration
- [x] 3.1 Create `app/api/vision/route.ts` for image uploads
- [x] 3.2 Convert image blob to FormData with `query` field
- [x] 3.3 Send multipart request to ShizhenGPT `/v1/vision/analyze`
- [x] 3.4 Return diagnosis text to frontend
- [x] 3.5 Add error handling for upload failures
Note: Frontend complete, backend `/v1/vision/analyze` endpoint needs implementation

## 4. Chat UI Integration
- [x] 4.1 Add camera icon button next to text input
- [x] 4.2 Show camera modal when button clicked
- [x] 4.3 Display captured image in user message bubble
- [x] 4.4 Display diagnosis in assistant message
- [x] 4.5 Support mixed text+image conversations

## 5. Mobile Optimization
- [x] 5.1 Use `facingMode: "user"` for front camera (selfie mode for tongue)
- [x] 5.2 Add toggle for front/back camera on mobile
- [ ] 5.3 Test on iOS Safari and Android Chrome
- [ ] 5.4 Handle orientation changes (portrait/landscape)
Note: Mobile testing requires physical devices

## 6. Testing & Documentation
- [x] 6.1 Test camera access on HTTPS localhost
- [x] 6.2 Test with various image formats and sizes (JPEG at 0.9 quality)
- [x] 6.3 Test error states (camera blocked, backend errors)
- [ ] 6.4 Update `frontend/README.md` with camera usage instructions
