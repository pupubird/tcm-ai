# Implementation Tasks

## 1. Setup & Dependencies
- [x] 1.1 Install WhatsApp client dependencies (`whatsapp-web.js`, `qrcode-terminal`, `puppeteer-extra`, `puppeteer-extra-plugin-stealth`)
- [x] 1.2 Create `whatsapp/` directory structure
- [x] 1.3 Add environment variables to `.env.example` and `.env`
- [x] 1.4 Configure TypeScript for WhatsApp module

## 2. Core WhatsApp Client
- [x] 2.1 Implement `whatsapp/client.ts` - WhatsApp Web authentication, QR code display, session persistence
- [x] 2.2 Implement `whatsapp/sessionStore.ts` - In-memory conversation history with 30-min expiry
- [x] 2.3 Implement `whatsapp/whitelist.ts` - Phone number validation (E.164 format)
- [x] 2.4 Implement `whatsapp/index.ts` - Entry point and server initialization

## 3. Message Handling
- [x] 3.1 Implement `whatsapp/messageHandler.ts` - Route text/image messages to APIs
- [x] 3.2 Add text message processing - POST to `/api/chat` with conversation history
- [x] 3.3 Add image message processing - Download media, convert to FormData, POST to `/api/vision`
- [x] 3.4 Implement response formatting - Strip markdown incompatible with WhatsApp, split long messages

## 4. Integration
- [x] 4.1 Configure API base URL resolution (env variable `FRONTEND_URL` default `http://localhost:3000`)
- [x] 4.2 Test text message flow end-to-end (WhatsApp → client → `/api/chat` → response)
- [x] 4.3 Test image message flow end-to-end (WhatsApp → client → `/api/vision` → response)
- [x] 4.4 Test session expiry and conversation context retention

## 5. Error Handling & Edge Cases
- [x] 5.1 Handle API connection failures gracefully (send user-friendly error message)
- [x] 5.2 Handle image conversion errors (unsupported formats, corrupted files)
- [x] 5.3 Handle WhatsApp disconnection and auto-reconnect
- [x] 5.4 Handle rate limiting (add delays between messages if needed)

## 6. Documentation & Scripts
- [x] 6.1 Add npm script `npm run whatsapp` to package.json
- [x] 6.2 Document setup process in README (QR code scan, whitelist config)
- [x] 6.3 Add troubleshooting section (common Puppeteer errors, session issues)

## 7. Testing
- [x] 7.1 Manual test: Send text query, verify TCM response received
- [x] 7.2 Manual test: Send tongue image, verify diagnosis received
- [x] 7.3 Manual test: Multi-turn conversation with context retention
- [x] 7.4 Manual test: Whitelist enforcement (blocked number receives rejection message)
- [x] 7.5 Manual test: Session expiry after 30 min idle (conversation resets)
- [x] 7.6 Manual test: Long message splitting (>4096 chars)
