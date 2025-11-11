# chat-ui Specification

## Purpose
Provides a web-based chat interface for users to consult with the ShizhenGPT Traditional Chinese Medicine AI model. The interface handles multi-turn conversations, displays TCM diagnoses and treatment recommendations, and provides a professional medical aesthetic suitable for healthcare applications.
## Requirements
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

### Requirement: Streaming Response Display
The system SHALL display assistant responses in real-time as tokens arrive.

#### Scenario: Streaming TCM diagnosis
- **WHEN** backend returns streaming response for "手脚冰凉是什么原因？"
- **THEN** each token is appended to assistant message as it arrives (e.g., "根据" → "根据中医" → "根据中医理论...")

#### Scenario: Streaming completion
- **WHEN** backend sends final token and closes stream
- **THEN** loading indicator disappears, input field is re-enabled

#### Scenario: Stream interruption
- **WHEN** network connection is lost during streaming
- **THEN** display error message "Connection lost" and enable retry button

### Requirement: Conversation History
The system SHALL maintain conversation context for multi-turn dialogues.

#### Scenario: Multi-turn consultation
- **WHEN** user asks "手脚冰凉是什么原因？" → assistant responds → user asks "有什么食疗方法？"
- **THEN** second query includes previous messages for context

#### Scenario: Clear conversation
- **WHEN** user clicks "Clear conversation" button
- **THEN** all messages are removed and new conversation starts

#### Scenario: Conversation persistence
- **WHEN** user refreshes browser page
- **THEN** conversation history is lost (no persistence in MVP)

### Requirement: Message Distinction
The system SHALL visually distinguish user and assistant messages using a clean, neutral color palette.

#### Scenario: User message display
- **WHEN** user sends message
- **THEN** message appears right-aligned with black background and white text in a rounded box with max-width constraints

#### Scenario: Assistant message display
- **WHEN** assistant responds
- **THEN** message appears left-aligned with white background, black text, and subtle gray border in a rounded box with max-width constraints

#### Scenario: Message width responsive behavior
- **WHEN** viewed on mobile (<640px)
- **THEN** messages are max 85% of container width
- **WHEN** viewed on tablet (640px-1024px)
- **THEN** messages are max 75% of container width
- **WHEN** viewed on desktop (>1024px)
- **THEN** messages are max 65% of container width

### Requirement: Loading State Indication
The system SHALL provide visual feedback during inference.

#### Scenario: Inference in progress
- **WHEN** message is submitted and awaiting response
- **THEN** loading spinner appears below last message

#### Scenario: Long inference time
- **WHEN** response takes >10 seconds
- **THEN** display "Model is thinking..." message with spinner

### Requirement: Error Handling
The system SHALL display user-friendly error messages for failures.

#### Scenario: Backend unavailable
- **WHEN** ShizhenGPT API is not running
- **THEN** display "Cannot connect to AI model. Please ensure backend is running at http://localhost:8000"

#### Scenario: Inference timeout
- **WHEN** backend returns 500 error with "Inference timeout exceeded"
- **THEN** display "Response took too long. Please try a simpler query."

#### Scenario: Retry after error
- **WHEN** error message is displayed
- **THEN** show "Retry" button that resends last user message

### Requirement: Responsive Design
The system SHALL adapt layout for mobile and desktop screens.

#### Scenario: Desktop view
- **WHEN** viewport width >768px
- **THEN** chat container is centered with max-width 800px, full message history visible

#### Scenario: Mobile view
- **WHEN** viewport width <768px
- **THEN** chat uses full width, input field remains fixed at bottom

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

### Requirement: Visual Design System
The system SHALL use a neutral, professional design system inspired by modern web applications.

#### Scenario: Color palette
- **WHEN** UI is rendered
- **THEN** use neutral blacks/grays/whites for all UI elements
- **AND** no bright colors (emerald, teal, etc.) except for error states (red)
- **AND** use subtle borders (gray-200/gray-300) instead of heavy shadows

#### Scenario: Typography consistency
- **WHEN** displaying text content
- **THEN** use consistent font sizes: text-lg for headers, text-base for body, text-sm for labels
- **AND** use font-semibold for headings, font-medium for labels, font-normal for body text

#### Scenario: Spacing and layout
- **WHEN** rendering UI components
- **THEN** use consistent spacing scale and proper whitespace
- **AND** center content with max-width container (max-w-3xl or similar)

### Requirement: Mobile Responsive Images
The system SHALL ensure images never overflow their containers on any screen size.

#### Scenario: Tongue image display in message
- **WHEN** message contains an image
- **THEN** image is constrained with `max-w-full h-auto` classes
- **AND** image has maximum height constraint (e.g., 300px) to prevent vertical overflow
- **AND** image has rounded corners and subtle border matching design system

#### Scenario: Image preview in input area
- **WHEN** user captures image before sending
- **THEN** preview image is constrained with `max-h-40` or similar
- **AND** preview never causes horizontal scroll on mobile

### Requirement: Mobile-First Responsive Layout
The system SHALL adapt layout and spacing based on screen size.

#### Scenario: Mobile layout (<640px)
- **WHEN** viewed on mobile device
- **THEN** use reduced padding (px-4 instead of px-6)
- **AND** use smaller font sizes where appropriate (text-sm instead of text-base)
- **AND** ensure touch targets are at least 44x44px
- **AND** no horizontal scrolling occurs

#### Scenario: Tablet layout (640px-1024px)
- **WHEN** viewed on tablet device
- **THEN** use medium padding (px-6)
- **AND** use base font sizes
- **AND** adjust message max-widths appropriately

#### Scenario: Desktop layout (>1024px)
- **WHEN** viewed on desktop
- **THEN** use spacious padding (px-8)
- **AND** messages use narrower max-width (65%) for better readability
- **AND** content container is centered with reasonable max-width

### Requirement: Generic Branding
The system SHALL not display specific AI model names or branding.

#### Scenario: Header display
- **WHEN** application loads
- **THEN** header shows generic title like "TCM Consultation" or "Traditional Chinese Medicine AI"
- **AND** no references to "ShizhenGPT" or "神针GPT" appear

#### Scenario: Message labels
- **WHEN** displaying assistant messages
- **THEN** use generic label like "Assistant" or no label at all
- **AND** no specific model name is shown

#### Scenario: Welcome message
- **WHEN** user first opens application with empty conversation
- **THEN** welcome message does not mention specific model names
- **AND** provides clear instructions in generic terms

#### Scenario: Page metadata
- **WHEN** page loads
- **THEN** document title and metadata describe generic "TCM Consultation" functionality
- **AND** no ShizhenGPT branding in meta tags or page title

