# WhatsApp Client for TCM Consultation

WhatsApp messaging interface for Traditional Chinese Medicine consultations using ShizhenGPT.

## Features

- **Text Consultations**: Send symptoms/questions → Receive TCM diagnosis
- **Tongue Image Analysis**: Send tongue photo → Receive TCM tongue diagnosis
- **Conversation History**: 30-minute session with context retention
- **Phone Number Whitelist**: Optional access control for authorized patients
- **Session Persistence**: Conversation history survives server restarts

## Prerequisites

- Node.js 18+ with TypeScript support
- Google Chrome or Chromium browser (for Puppeteer)
- TCM frontend API running at `http://localhost:3000`
- WhatsApp account (for linking via QR code)

## Setup

### 1. Install Dependencies

```bash
cd whatsapp
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Frontend API URL
FRONTEND_URL=http://localhost:3000

# WhatsApp session path
WHATSAPP_SESSION_PATH=./.wwebjs_auth

# Session expiry (minutes)
WHATSAPP_SESSION_EXPIRY_MINUTES=30

# Phone whitelist (optional, E.164 format)
WHATSAPP_WHITELIST=+60123456789,+60198765432
# Leave empty to allow all numbers
```

### 3. Start the WhatsApp Client

```bash
npm start
```

### 4. Link WhatsApp Account

On first run, a QR code will be displayed in the terminal:

1. Open WhatsApp on your mobile phone
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code shown in the terminal

The session will be saved in `.wwebjs_auth/` and persist across restarts.

## Usage

### Text Consultations

Users send WhatsApp messages like:

```
User: 最近失眠，是什么原因？
Bot: [TCM diagnosis about insomnia causes]

User: 有什么食疗方法？
Bot: [Dietary therapy recommendations based on previous context]
```

### Tongue Image Analysis

Users send tongue photos via WhatsApp:

```
User: [sends tongue image]
Bot: [TCM tongue diagnosis including coating color, tongue body color, etc.]
```

## Whitelist Configuration

### E.164 Phone Format

Phone numbers must be in **E.164 international format**:

- ✅ Correct: `+60123456789` (Malaysia)
- ✅ Correct: `+8613800138000` (China)
- ✅ Correct: `+12125551234` (USA)
- ❌ Wrong: `0123456789` (missing country code)
- ❌ Wrong: `60-123-456-789` (contains hyphens)

### Allow All Numbers (Development)

Leave `WHATSAPP_WHITELIST` empty:

```env
WHATSAPP_WHITELIST=
```

### Restrict to Specific Numbers (Production)

```env
WHATSAPP_WHITELIST=+60123456789,+60198765432,+8613800138000
```

Blocked users will receive:

```
访问被拒绝。此号码未被授权。
(Access denied. This number is not authorized.)
```

## Session Management

- **Session Duration**: 30 minutes (configurable via `WHATSAPP_SESSION_EXPIRY_MINUTES`)
- **Conversation Context**: Maintained across multiple messages
- **Auto-Expiry**: Sessions reset after 30 min idle time (privacy protection)
- **Persistence**: Sessions saved to `whatsapp_sessions.json` (survives restarts)

Example session lifecycle:

```
10:00 AM - User sends "手脚冰凉"
10:02 AM - Bot responds with diagnosis
10:05 AM - User asks "有什么食疗方法？" (context retained)
10:10 AM - Bot responds with dietary recommendations
10:45 AM - [35 minutes later, session expired]
10:46 AM - User sends new message (starts fresh session, no context)
```

## Troubleshooting

### QR Code Not Appearing

1. Check Chrome/Chromium installation:
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version
   ```

2. If using different browser path, update `client.ts`:
   ```typescript
   executablePath: '/path/to/your/chrome'
   ```

### "Backend API unreachable"

Ensure the frontend is running:

```bash
# In the main project directory
npm run dev
```

Verify APIs are accessible:

```bash
curl http://localhost:3000/api/chat
# Should return 405 Method Not Allowed (expected)
```

### Session Authentication Failed

Delete session and re-scan QR code:

```bash
rm -rf .wwebjs_auth
npm start
```

### Puppeteer Download Issues

If Chromium download fails during installation:

```bash
# Use system Chrome instead
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install
```

### WhatsApp Disconnection

Common causes:
- Mobile phone went offline
- WhatsApp Web session logged out on phone
- Network connectivity issues

**Solution**: Client will auto-reconnect. If persistent, delete `.wwebjs_auth/` and re-link.

## Architecture

```
WhatsApp User (Mobile App)
         ↓
   WhatsApp Web (Puppeteer)
         ↓
   whatsapp/index.ts (Entry Point)
         ↓
   messageHandler.ts (Routing)
         ↓
   ┌─────────────────┐
   │ Text Message?   │ → POST /api/chat → TCM Response
   │ Image Message?  │ → POST /api/vision → Tongue Diagnosis
   └─────────────────┘
         ↓
   sessionStore.ts (History)
```

## File Structure

```
whatsapp/
├── index.ts              # Entry point, initialization
├── client.ts             # WhatsApp Web authentication
├── messageHandler.ts     # Message routing logic
├── sessionStore.ts       # Conversation history management
├── whitelist.ts          # Phone number validation
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .env.example          # Environment template
├── .env                  # Your configuration (git-ignored)
├── .wwebjs_auth/         # WhatsApp session data (git-ignored)
└── whatsapp_sessions.json # Conversation history (git-ignored)
```

## Security Notes

- **Localhost Only**: No external API calls, all data stays local
- **Session Privacy**: Auto-expiry after 30 min (configurable)
- **No Message Persistence**: Conversations not stored beyond session
- **Whitelist Protection**: Optional phone number access control

## Performance

- **Text Response Time**: 2-5s (GPU), 10-30s (CPU)
- **Image Response Time**: 5-10s (GPU), 30-60s (CPU)
- **Memory Usage**: ~200MB (Chromium + Node.js)
- **Max Message Length**: 4096 chars (auto-split for longer responses)

## Running as Background Service

### Using PM2

```bash
npm install -g pm2
cd whatsapp
pm2 start index.ts --name tcm-whatsapp
pm2 save
pm2 startup  # Auto-start on system boot
```

### Using systemd (Linux)

Create `/etc/systemd/system/tcm-whatsapp.service`:

```ini
[Unit]
Description=TCM WhatsApp Client
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/qtyf-tcm-test/whatsapp
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable tcm-whatsapp
sudo systemctl start tcm-whatsapp
sudo systemctl status tcm-whatsapp
```

## Limitations

- **Unofficial API**: whatsapp-web.js may break if WhatsApp updates protocol
- **1-on-1 Only**: Group chats not supported
- **Text + Images**: Audio/video messages not supported
- **No Streaming**: Responses sent as complete messages (not token-by-token)

## Support

For issues related to:
- **WhatsApp connection**: Check [whatsapp-web.js GitHub](https://github.com/pedroslopez/whatsapp-web.js)
- **TCM diagnosis accuracy**: Verify backend ShizhenGPT model is loaded
- **API errors**: Ensure frontend (`npm run dev`) and backend (`uvicorn`) are running
