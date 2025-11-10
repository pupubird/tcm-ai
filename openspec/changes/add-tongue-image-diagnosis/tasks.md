# Implementation Tasks

## 1. Camera Capture Component
- [ ] 1.1 Create `components/CameraCapture.tsx` using MediaDevices API
- [ ] 1.2 Add video preview element showing live camera feed
- [ ] 1.3 Implement canvas-based photo capture (convert to blob)
- [ ] 1.4 Add "Capture" and "Retake" buttons
- [ ] 1.5 Handle camera permission requests and denials

## 2. File Upload Fallback
- [ ] 2.1 Add file input accepting `image/png,image/jpeg,image/webp`
- [ ] 2.2 Validate file size (max 10MB)
- [ ] 2.3 Display image preview before submission
- [ ] 2.4 Add "Remove image" button to clear selection

## 3. Backend API Integration
- [ ] 3.1 Create `app/api/vision/route.ts` for image uploads
- [ ] 3.2 Convert image blob to FormData with `query` field
- [ ] 3.3 Send multipart request to ShizhenGPT `/v1/vision/analyze`
- [ ] 3.4 Return diagnosis text to frontend
- [ ] 3.5 Add error handling for upload failures

## 4. Chat UI Integration
- [ ] 4.1 Add camera icon button next to text input
- [ ] 4.2 Show camera modal when button clicked
- [ ] 4.3 Display captured image in user message bubble
- [ ] 4.4 Display diagnosis in assistant message
- [ ] 4.5 Support mixed text+image conversations

## 5. Mobile Optimization
- [ ] 5.1 Use `facingMode: "user"` for front camera (selfie mode for tongue)
- [ ] 5.2 Add toggle for front/back camera on mobile
- [ ] 5.3 Test on iOS Safari and Android Chrome
- [ ] 5.4 Handle orientation changes (portrait/landscape)

## 6. Testing & Documentation
- [ ] 6.1 Test camera access on HTTPS localhost
- [ ] 6.2 Test with various image formats and sizes
- [ ] 6.3 Test error states (camera blocked, invalid file)
- [ ] 6.4 Update `frontend/README.md` with camera usage instructions
