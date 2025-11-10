# Design: TCM Chat Interface

## Context
The chat UI provides a web interface for text-based TCM consultations with ShizhenGPT. Users expect real-time streaming responses (not blocking), conversation context preservation, and a medical-professional aesthetic.

**Constraints:**
- Localhost-only deployment (no authentication needed)
- Must work on mobile and desktop browsers
- No backend database (conversation history in browser only)

## Goals / Non-Goals

**Goals:**
- Streaming text responses with visual feedback
- Multi-turn conversation support (maintain context)
- Simple, clean UI focused on readability
- <100 lines of React code for main chat component

**Non-Goals:**
- User accounts or conversation persistence across sessions
- Conversation export/sharing features
- Voice input (text-only for now)
- Advanced formatting (Markdown rendering)

## Decisions

### Decision 1: Vercel AI SDK over Custom Fetch
**Rationale:** Built-in streaming, React hooks, OpenAI compatibility

**Alternatives considered:**
- Raw `fetch` with SSE parsing: More code, reinventing the wheel
- LiveKit Agents SDK: Overkill, requires WebRTC infrastructure

**Vercel AI SDK benefits:**
- `useChat` hook handles streaming, state management, error recovery
- `streamText` API route helper parses SSE automatically
- OpenAI-compatible format matches ShizhenGPT API design

### Decision 2: Next.js App Router (Not Pages Router)
**Rationale:** React Server Components, simpler API routes, modern standard

**Trade-off:** Steeper learning curve but aligns with Next.js 15 best practices

### Decision 3: Client-Side Conversation Storage
**Rationale:** No backend database needed for MVP, faster development

**Implementation:** Store messages in React state (`useChat` manages this)

**Migration path:** If persistence needed later, add `onFinish` callback to save to localStorage or backend

### Decision 4: Tailwind CSS over Component Library
**Rationale:** Full design control, no library bloat

**Alternatives considered:**
- Shadcn UI: Nice but adds complexity
- Material-UI: Heavy, opinionated design

## Implementation Pattern

**File structure:**
```
frontend/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # Streaming API endpoint
│   ├── page.tsx               # Main chat UI
│   └── layout.tsx             # Root layout
├── .env.local                 # ShizhenGPT API URL
└── package.json
```

**Key code pattern (app/api/chat/route.ts):**
```typescript
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const shizhengpt = createOpenAI({
  baseURL: process.env.SHIZHENGPT_API_URL + '/v1',
  apiKey: 'dummy' // Not used by local API
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: shizhengpt('ShizhenGPT-7B-LLM'),
    messages,
  });
  return result.toDataStreamResponse();
}
```

**Key code pattern (app/page.tsx):**
```typescript
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

## Risks / Trade-offs

**Risk 1: Backend connection failure**
- **Mitigation:** Display clear error message, retry button, check backend health on mount

**Risk 2: Slow inference causing user confusion**
- **Mitigation:** Show loading spinner, display partial tokens as they stream

**Risk 3: Long conversations causing memory issues**
- **Mitigation:** Warn after 50 messages, add "Start new conversation" button

## Migration Plan
N/A - New capability, no migration needed.

## Open Questions
1. Should we add conversation history sidebar?
   - **Answer:** No for MVP, single conversation window is sufficient
2. Markdown rendering for formatted responses?
   - **Answer:** Defer to future change, keep plain text for now
