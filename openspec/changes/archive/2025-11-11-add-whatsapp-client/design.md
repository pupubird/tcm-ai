# WhatsApp Client Design

## Context

The TCM diagnostic system currently provides web-based chat interface (`chat-ui`) that consumes backend inference APIs (`model-inference`). This change adds WhatsApp as an alternative interface channel, targeting users who prefer messaging apps over web browsers.

**Key Constraints:**
- Existing APIs (`/api/chat`, `/api/vision`) must remain unchanged (no backend modifications)
- WhatsApp client must run as independent process (separate from Next.js server)
- Medical data privacy requires localhost-only operation (no external WhatsApp API services)
- Unofficial WhatsApp Web API dependency (whatsapp-web.js) may break with WhatsApp updates

**Stakeholders:**
- TCM practitioners who want to serve patients via WhatsApp
- Patients who prefer familiar messaging interfaces
- Developers maintaining the system

## Goals / Non-Goals

**Goals:**
- Enable text-based TCM consultations via WhatsApp
- Support tongue image analysis via WhatsApp image upload
- Maintain conversation context across multiple messages
- Provide access control via phone number whitelist
- Minimize implementation complexity (~250 lines of code)

**Non-Goals:**
- Multi-agent architecture (single message router is sufficient)
- Group chat support (1-on-1 consultations only)
- Message persistence beyond 30-min sessions (privacy-first design)
- WhatsApp Business API integration (avoiding paid/official APIs)
- Audio/video message support (scope limited to text + images)

## Decisions

### Decision 1: whatsapp-web.js over WhatsApp Business API

**Choice:** Use whatsapp-web.js (unofficial Puppeteer-based client)

**Alternatives considered:**
1. **WhatsApp Business API (official)** - Requires business verification, paid Meta account, webhook setup
2. **Baileys (unofficial)** - Pure WebSocket implementation, less stable than whatsapp-web.js
3. **whatsapp-web.js** ✓ - Mature library, session persistence, simple QR auth

**Rationale:**
- Zero cost, no Meta business account needed
- QR code authentication same as WhatsApp Web (familiar to users)
- Large community, actively maintained (1.3k+ stars on GitHub)
- Session persistence across restarts (no re-authentication)

**Trade-offs:**
- ⚠️ Unofficial API - may break if WhatsApp changes Web client protocol
- ⚠️ Requires Puppeteer (Chromium dependency ~170MB download)
- ✓ No external dependencies or paid accounts

### Decision 2: Session-based conversation history (30-min expiry)

**Choice:** In-memory Map with file persistence, 30-min idle timeout

**Alternatives considered:**
1. **No session management** - Each message treated independently (no context)
2. **Persistent database storage** - SQLite/Postgres for conversation history
3. **In-memory with expiry** ✓ - Balance between context retention and privacy

**Rationale:**
- TCM consultations are typically sequential (ask symptoms → get diagnosis → follow-up)
- 30 minutes aligns with typical consultation timeframe
- Privacy-first: Auto-expiry prevents indefinite data retention
- Survives process restarts via file persistence

**Trade-offs:**
- ⚠️ Sessions lost if idle >30 min (user must restate context)
- ⚠️ Not suitable for multi-day consultations (intentional privacy design)
- ✓ Simple implementation, no database dependency

### Decision 3: Direct API integration (no agent framework)

**Choice:** Simple message router - text → `/api/chat`, image → `/api/vision`

**Alternatives considered:**
1. **OpenAI Agents SDK** - Agentic reasoning with tool selection (like manja-poc2)
2. **LangChain orchestration** - Complex multi-step flows
3. **Direct routing** ✓ - If-else message type detection

**Rationale:**
- Backend already provides TCM inference - no tool selection needed
- Two message types (text, image) map cleanly to two API endpoints
- Minimal complexity (~100 lines vs. 2000+ for agent framework)

**Trade-offs:**
- ⚠️ Limited to text/image (can't chain multiple operations)
- ✓ Zero AI framework overhead
- ✓ Predictable behavior (no hallucination in routing logic)

### Decision 4: Phone number whitelist (optional enforcement)

**Choice:** Environment variable `WHATSAPP_WHITELIST` with E.164 format validation

**Alternatives considered:**
1. **No access control** - Allow all WhatsApp users
2. **IP-based filtering** - Not applicable (localhost deployment)
3. **Phone whitelist** ✓ - Simple, effective for small user bases

**Rationale:**
- Practitioners may want to limit access to known patients
- E.164 format (`+60123456789`) is standard, unambiguous
- Empty whitelist = allow all (easy development/testing)

**Trade-offs:**
- ⚠️ Requires manual phone number management (no UI)
- ⚠️ International format may confuse non-technical users
- ✓ Simple CSV in environment variable (no database)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   WhatsApp User                          │
│         (sends text or image via WhatsApp app)          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ whatsapp-web.js    │  (Puppeteer emulates WhatsApp Web)
        │ (Chromium browser) │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ WhatsApp Client    │
        │ - Authentication   │  (QR code scan on first run)
        │ - Event listeners  │  (message, disconnected, ready)
        └────────┬───────────┘
                 │
                 ▼
        ┌─────────────────────────────────────┐
        │ Message Handler                      │
        │ - Whitelist check                    │
        │ - Session lookup (get history)       │
        │ - Route to API:                      │
        │   • Text → /api/chat                 │
        │   • Image → /api/vision              │
        │ - Update session (save new history)  │
        └────────┬────────────────────────────┘
                 │
        ┌────────▼─────────────────────────────┐
        │ Existing APIs                        │
        │ - POST localhost:3000/api/chat       │
        │ - POST localhost:3000/api/vision     │
        │   (Next.js → FastAPI → ShizhenGPT)  │
        └────────┬─────────────────────────────┘
                 │
        ┌────────▼──────────────────────┐
        │ Response Processing           │
        │ - Strip markdown (** → plain) │
        │ - Split long messages (>4096) │
        │ - Send back to WhatsApp       │
        └───────────────────────────────┘
```

## Data Models

### Session Data Structure
```typescript
interface SessionData {
  customerId: string;           // Phone number (E.164 format)
  conversationHistory: Array<{  // API-compatible message format
    role: 'user' | 'assistant';
    content: string;
  }>;
  lastActivity: number;         // Unix timestamp
  messageCount: number;         // Total messages in session
}
```

### Message Flow
```typescript
// Text Message
WhatsApp.Message.body → string
  ↓
POST /api/chat { messages: [...history, { role: 'user', content: body }] }
  ↓
Response { messages: [...history, { role: 'assistant', content: 'TCM diagnosis' }] }
  ↓
Update session.conversationHistory
  ↓
Send response.content via WhatsApp

// Image Message
WhatsApp.Message.media → MessageMedia (base64)
  ↓
Convert to Buffer → FormData.append('image', Blob)
  ↓
POST /api/vision (multipart/form-data)
  ↓
Response { diagnosis: 'TCM tongue analysis', success: true }
  ↓
Send response.diagnosis via WhatsApp
```

## Risks / Trade-offs

### Risk 1: WhatsApp Web protocol changes
**Impact:** whatsapp-web.js may stop working if WhatsApp updates their Web client
**Likelihood:** Medium (happens 1-2 times per year based on GitHub issues)
**Mitigation:**
- Pin whatsapp-web.js version in package.json
- Monitor library GitHub for breaking changes
- Test after WhatsApp Web updates
- Fallback: Switch to Baileys library or official Business API if needed

### Risk 2: Puppeteer resource usage
**Impact:** Chromium process consumes ~200MB RAM, potential conflicts with GPU resources
**Likelihood:** Low (separate process from model inference)
**Mitigation:**
- Run WhatsApp client on separate machine if resources are tight
- Use headless mode (no GUI rendering)
- Enable stealth plugin to avoid detection/blocking

### Risk 3: Session file corruption
**Impact:** Lost conversation history if `whatsapp_sessions.json` corrupted
**Likelihood:** Low (debounced writes, atomic file operations)
**Mitigation:**
- Graceful degradation: Start new session if file unreadable
- Notify user: "Session expired, please restate your question"
- Consider versioned backups if critical

### Risk 4: Whitelist bypass
**Impact:** Unauthorized users access system if whitelist incorrectly configured
**Likelihood:** Low (simple string matching on E.164 format)
**Mitigation:**
- Log all rejected access attempts
- Validate phone format on startup (reject invalid entries)
- Send rejection message to blocked numbers (clear feedback)

## Migration Plan

### Phase 1: Development Setup
1. Install dependencies: `npm install whatsapp-web.js qrcode-terminal puppeteer-extra puppeteer-extra-plugin-stealth`
2. Add environment variables to `.env`
3. Create WhatsApp client files in `whatsapp/` directory

### Phase 2: Testing & Validation
1. Run `npm run whatsapp` and scan QR code with test WhatsApp account
2. Verify text message flow (send "失眠怎么办？", expect TCM response)
3. Verify image message flow (send tongue photo, expect diagnosis)
4. Test whitelist enforcement
5. Test session expiry (wait 30 min, verify new session starts)

### Phase 3: Production Deployment
1. Link practitioner's WhatsApp account (QR scan)
2. Configure whitelist with patient phone numbers
3. Run as background service (e.g., PM2, systemd)
4. Monitor logs for errors/disconnections

### Rollback Plan
- Stop WhatsApp client process (`pkill -f whatsapp`)
- Remove `.wwebjs_auth/` to unlink account
- Web interface continues working independently
- No data loss (backend APIs unchanged)

## Open Questions

1. **Should we support group chats?**
   → Decision: No, scope limited to 1-on-1 consultations (privacy, complexity)

2. **How to handle multiple practitioners sharing one system?**
   → Out of scope for MVP - each practitioner runs their own WhatsApp client instance

3. **Should conversation history persist beyond 30 minutes?**
   → Decision: No, privacy-first design (auto-expiry prevents data accumulation)

4. **Do we need message delivery receipts (read/delivered status)?**
   → Out of scope for MVP - WhatsApp already provides this natively
