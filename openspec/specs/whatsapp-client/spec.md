# whatsapp-client Specification

## Purpose
Provides WhatsApp messaging interface for TCM consultations, enabling users to interact with ShizhenGPT via WhatsApp instead of web browser. Handles text-based consultations and tongue image analysis through WhatsApp message routing to existing backend APIs.
## Requirements
### Requirement: WhatsApp Authentication
The system SHALL authenticate with WhatsApp Web using QR code and persist sessions.

#### Scenario: First-time setup
- **WHEN** WhatsApp client starts without existing session
- **THEN** display QR code in terminal for user to scan with WhatsApp mobile app

#### Scenario: Session persistence
- **WHEN** WhatsApp client restarts with valid session in `.wwebjs_auth/`
- **THEN** automatically reconnect without requiring QR scan

#### Scenario: Session expiration
- **WHEN** WhatsApp Web session expires (unlinked on mobile)
- **THEN** display new QR code and log "Session expired, please re-scan QR code"

### Requirement: Phone Number Whitelist
The system SHALL enforce optional phone number access control.

#### Scenario: Whitelist enforcement enabled
- **WHEN** `WHATSAPP_WHITELIST=+60123456789,+60198765432` is configured
- **AND** message arrives from `+60111111111`
- **THEN** reject message and send reply "Access denied. This number is not authorized."

#### Scenario: Whitelist disabled
- **WHEN** `WHATSAPP_WHITELIST` is empty or not set
- **THEN** accept messages from all WhatsApp users

#### Scenario: Phone number format validation
- **WHEN** whitelist contains invalid format (e.g., `0123456789` without `+` prefix)
- **THEN** log error on startup "Invalid whitelist entry: 0123456789 (must use E.164 format)"

### Requirement: Text Message Routing
The system SHALL route text messages to chat API with conversation history.

#### Scenario: Simple text query
- **WHEN** user sends WhatsApp message "最近失眠，是什么原因？"
- **THEN** POST to `/api/chat` with message array including conversation history
- **AND** send assistant response back to WhatsApp

#### Scenario: Multi-turn conversation
- **WHEN** user sends follow-up message "有什么食疗方法？"
- **AND** previous conversation exists in session
- **THEN** include full history in API request for context
- **AND** update session with new assistant response

#### Scenario: API connection failure
- **WHEN** `/api/chat` is unreachable (ECONNREFUSED)
- **THEN** send WhatsApp message "Service temporarily unavailable. Please ensure the backend is running at http://localhost:3000"

### Requirement: Image Message Routing
The system SHALL route image messages to vision API for tongue diagnosis.

#### Scenario: Tongue image upload
- **WHEN** user sends image via WhatsApp
- **THEN** download media, convert to FormData, POST to `/api/vision`
- **AND** send diagnosis response back to WhatsApp

#### Scenario: Unsupported media type
- **WHEN** user sends video or audio message
- **THEN** send reply "Please send images only for tongue diagnosis. Text messages are supported for consultations."

#### Scenario: Image download failure
- **WHEN** WhatsApp media download fails (corrupted/expired)
- **THEN** send reply "Failed to download image. Please try sending again."

#### Scenario: Vision API error
- **WHEN** `/api/vision` returns 500 error
- **THEN** send reply "Failed to analyze image. Please try again with better lighting and clear tongue visibility."

### Requirement: Session Management
The system SHALL maintain conversation history with automatic expiry.

#### Scenario: New session creation
- **WHEN** message arrives from new phone number
- **THEN** create session with empty conversation history

#### Scenario: Session expiry
- **WHEN** 30 minutes elapse since last message
- **AND** user sends new message
- **THEN** clear conversation history and start fresh session

#### Scenario: Session persistence
- **WHEN** WhatsApp client process restarts
- **THEN** load sessions from `whatsapp_sessions.json` file
- **AND** preserve conversation history for unexpired sessions

### Requirement: Response Formatting
The system SHALL format API responses for WhatsApp compatibility.

#### Scenario: Markdown stripping
- **WHEN** API returns response with `**bold text**` or `*italic*`
- **THEN** convert to plain text (WhatsApp interprets `*` as bold formatting)

#### Scenario: Long message splitting
- **WHEN** API response exceeds 4096 characters (WhatsApp limit)
- **THEN** split at sentence boundaries and send as multiple messages
- **AND** add 500ms delay between messages to avoid rate limiting

#### Scenario: Empty response handling
- **WHEN** API returns empty or null content
- **THEN** send "Sorry, no response received. Please try again."

### Requirement: Error Handling
The system SHALL provide clear error messages for failures.

#### Scenario: Backend offline
- **WHEN** neither `/api/chat` nor `/api/vision` are reachable
- **THEN** send "Backend service is offline. Please contact administrator."

#### Scenario: Timeout
- **WHEN** API request takes >60 seconds
- **THEN** send "Request timed out. Please try a simpler query."

#### Scenario: WhatsApp disconnection
- **WHEN** WhatsApp Web connection is lost
- **THEN** log "WhatsApp disconnected, attempting reconnect..." and retry connection

### Requirement: Logging
The system SHALL log message activity for debugging.

#### Scenario: Message received log
- **WHEN** WhatsApp message arrives
- **THEN** log: timestamp, sender phone number, message type (text/image), whitelist status

#### Scenario: API request log
- **WHEN** API request is sent
- **THEN** log: endpoint URL, request size (bytes), response time (ms)

#### Scenario: Error log
- **WHEN** error occurs (API failure, media download error, etc.)
- **THEN** log: error type, stack trace, sender context

### Requirement: Startup Health Check
The system SHALL verify dependencies on startup.

#### Scenario: Environment variables validation
- **WHEN** WhatsApp client starts
- **THEN** verify `FRONTEND_URL` is set (default `http://localhost:3000`)
- **AND** verify Chrome/Chromium executable exists for Puppeteer

#### Scenario: Session directory creation
- **WHEN** `.wwebjs_auth/` directory does not exist
- **THEN** create directory automatically

#### Scenario: Backend availability check
- **WHEN** client starts
- **THEN** attempt GET request to `${FRONTEND_URL}/api/chat` (expect 405 Method Not Allowed, confirms endpoint exists)
- **AND** log warning if unreachable

