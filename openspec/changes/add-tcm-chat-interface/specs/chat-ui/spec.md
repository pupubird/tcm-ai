# Chat UI Capability

## ADDED Requirements

### Requirement: Text Message Input
The system SHALL accept user text input and send it to the backend API.

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
The system SHALL visually distinguish user and assistant messages.

#### Scenario: User message display
- **WHEN** user sends message
- **THEN** message appears right-aligned with distinct background color

#### Scenario: Assistant message display
- **WHEN** assistant responds
- **THEN** message appears left-aligned with different background color

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
