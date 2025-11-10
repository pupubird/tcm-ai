# Chat UI Capability (Delta)

## MODIFIED Requirements

### Requirement: Text Message Input
The system SHALL accept user text input or image input and send it to the appropriate backend API.

#### Scenario: User submits message
- **WHEN** user types "最近失眠，是什么原因？" and presses Enter
- **THEN** message is sent to `/api/chat` and displayed in conversation history

#### Scenario: Empty message submission
- **WHEN** user presses Enter with empty input field
- **THEN** form submission is prevented, no API call made

#### Scenario: Multi-line input support
- **WHEN** user types Shift+Enter
- **THEN** newline is inserted without submitting

## ADDED Requirements

### Requirement: Camera Capture
The system SHALL provide camera access for capturing tongue images.

#### Scenario: Open camera modal
- **WHEN** user clicks camera icon button next to text input
- **THEN** camera modal opens with live video preview

#### Scenario: Front camera default
- **WHEN** camera modal opens on mobile device
- **THEN** front-facing camera is activated by default (for selfie-style tongue capture)

#### Scenario: Capture photo
- **WHEN** user clicks "Capture" button in camera modal
- **THEN** current video frame is captured as JPEG image and preview is shown

#### Scenario: Retake photo
- **WHEN** user clicks "Retake" button after capture
- **THEN** captured image is discarded and video preview resumes

#### Scenario: Camera permission denied
- **WHEN** browser blocks camera access
- **THEN** display error message "Camera access denied. Please enable in browser settings or use file upload."

### Requirement: File Upload Fallback
The system SHALL accept image file uploads as alternative to camera capture.

#### Scenario: Upload tongue image
- **WHEN** user clicks file input and selects PNG/JPEG/WebP file
- **THEN** image preview is shown in modal

#### Scenario: File size limit
- **WHEN** user selects file >10MB
- **THEN** display error "File too large. Maximum size is 10MB."

#### Scenario: Invalid file type
- **WHEN** user selects non-image file (e.g., .pdf)
- **THEN** display error "Invalid file type. Please upload PNG, JPEG, or WebP image."

### Requirement: Tongue Diagnosis Submission
The system SHALL send captured/uploaded images to vision API with TCM query.

#### Scenario: Submit tongue image for diagnosis
- **WHEN** user confirms captured image in modal
- **THEN** image is sent to `/api/vision` with query "请从中医角度解读这张舌苔。"

#### Scenario: Display image in chat
- **WHEN** image is submitted
- **THEN** user message shows image thumbnail with caption "Tongue image for analysis"

#### Scenario: Display diagnosis response
- **WHEN** backend returns diagnosis
- **THEN** assistant message displays TCM analysis text below image message

#### Scenario: Vision API error
- **WHEN** backend returns 500 error for image analysis
- **THEN** display "Failed to analyze image. Please try again with better lighting."

### Requirement: Image Preview in Conversation
The system SHALL display image thumbnails in conversation history.

#### Scenario: Image thumbnail display
- **WHEN** user submits tongue image
- **THEN** message bubble shows 200x200px thumbnail (preserving aspect ratio)

#### Scenario: View full-size image
- **WHEN** user clicks image thumbnail
- **THEN** full-size image opens in modal overlay

#### Scenario: Close image viewer
- **WHEN** user clicks outside image or presses Escape
- **THEN** modal closes and returns to chat

### Requirement: Mobile Camera Optimization
The system SHALL optimize camera experience for mobile devices.

#### Scenario: Mobile camera resolution
- **WHEN** camera opens on mobile device
- **THEN** video stream uses 1280x720 resolution (balance quality and performance)

#### Scenario: Camera switch button
- **WHEN** user is on mobile device
- **THEN** "Switch Camera" button appears to toggle between front/back cameras

#### Scenario: Portrait orientation handling
- **WHEN** device is rotated during camera capture
- **THEN** video preview adjusts to maintain correct aspect ratio

### Requirement: Loading State for Image Analysis
The system SHALL indicate processing status during image analysis.

#### Scenario: Image upload in progress
- **WHEN** image is being uploaded to backend
- **THEN** loading spinner with text "Uploading image..." appears

#### Scenario: Analysis in progress
- **WHEN** backend is processing image
- **THEN** loading message changes to "Analyzing tongue image..." with spinner

#### Scenario: Analysis timeout
- **WHEN** analysis takes >30 seconds
- **THEN** display warning "Analysis is taking longer than usual..." but continue waiting
