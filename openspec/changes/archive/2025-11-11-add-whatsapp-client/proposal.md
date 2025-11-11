# WhatsApp Client for TCM Consultation

## Why

The current TCM diagnostic system is web-only, limiting accessibility. WhatsApp has 2.4 billion users globally with strong penetration in Asia where Traditional Chinese Medicine is popular. A WhatsApp interface removes friction for users:
- No app installation or website visit required
- Works on feature phones and low-end devices
- Familiar conversation interface (especially for elderly patients)
- Natural fit for consultation-style interactions

This addresses a real accessibility gap for TCM healthcare delivery.

## What Changes

- Add WhatsApp client using whatsapp-web.js library (Puppeteer-based web client emulation)
- Route text messages to existing `/api/chat` endpoint for TCM consultation
- Route image messages to existing `/api/vision` endpoint for tongue diagnosis
- Implement session management for conversation history (30-min expiry)
- Support QR code authentication for WhatsApp Web connection
- Handle message media (images) with automatic conversion to API-compatible format

**No breaking changes** - WhatsApp client is an independent interface consuming existing APIs.

## Impact

**Affected specs:**
- **NEW:** `whatsapp-client` (new capability spec)
- **UNCHANGED:** `chat-ui` (existing web interface continues unchanged)
- **UNCHANGED:** `model-inference` (backend APIs remain unchanged)

**Affected code:**
- New directory: `whatsapp/` (isolated WhatsApp client implementation)
- New dependencies: `whatsapp-web.js`, `qrcode-terminal`, `puppeteer-extra`
- Environment variables:
  - `WHATSAPP_SESSION_PATH` (default `.wwebjs_auth/`)
  - `WHATSAPP_SESSION_EXPIRY_MINUTES` (default 30)
  - `WHATSAPP_WHITELIST` (comma-separated phone numbers, optional - empty means allow all)

**Infrastructure:**
- Independent Node.js process (separate from Next.js dev/prod server)
- Requires Chrome/Chromium browser installation (Puppeteer dependency)
- Session persistence via filesystem (`.wwebjs_auth/` directory)
- Localhost-only operation (no external WhatsApp API calls)

**Deployment:**
- Can run alongside web frontend (different ports/processes)
- Requires initial QR code scan to link WhatsApp account
- Session persists across restarts (no re-authentication needed)
