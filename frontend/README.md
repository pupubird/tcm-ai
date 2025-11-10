# ShizhenGPT Chat Interface

Traditional Chinese Medicine consultation chat interface powered by ShizhenGPT-32B-VL.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` file:
```env
SHIZHENGPT_API_URL=https://3wzca59jx2ytll-8000.proxy.runpod.net
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Streaming Responses**: Real-time token streaming from ShizhenGPT model
- **Multi-turn Conversations**: Maintains conversation context automatically
- **Responsive Design**: Works on desktop and mobile browsers
- **Error Handling**: Clear error messages for connection issues
- **Clean UI**: Medical-professional aesthetic with emerald/teal color scheme

## API Integration

The chat interface uses Vercel AI SDK to connect to the ShizhenGPT API:

- **Endpoint**: `/api/chat` (Next.js API route)
- **Backend**: `SHIZHENGPT_API_URL/v1/chat/completions`
- **Model**: ShizhenGPT-32B-VL
- **Streaming**: Server-Sent Events (SSE)

## Testing

### Health Check
Verify backend is running:
```bash
curl https://3wzca59jx2ytll-8000.proxy.runpod.net/health
```

### Example Query
Try asking: "手脚冰凉，经常怕冷，是什么原因？" (Why are my hands and feet cold?)

## Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # Streaming API endpoint
│   ├── page.tsx               # Main chat UI
│   └── layout.tsx             # Root layout
├── .env.local                 # Environment variables
└── package.json               # Dependencies
```

## Technologies

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **Vercel AI SDK**: Streaming chat capabilities
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety

## Troubleshooting

### Backend Connection Error
- Ensure ShizhenGPT API is running on RunPod
- Check `.env.local` has correct `SHIZHENGPT_API_URL`
- Verify health endpoint returns `{"status": "healthy"}`

### Slow Responses
- Model inference takes 2-3 seconds
- Streaming shows partial responses as they generate
- Check RunPod GPU is not throttled

### Build Issues
- Delete `node_modules` and run `npm install` again
- Check Node.js version (requires Node 18+)
