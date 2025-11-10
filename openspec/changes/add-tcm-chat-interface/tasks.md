# Implementation Tasks

## 1. Project Scaffolding
- [ ] 1.1 Run `npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir`
- [ ] 1.2 Install Vercel AI SDK: `npm install ai @ai-sdk/openai`
- [ ] 1.3 Configure environment variables in `.env.local`

## 2. Backend API Route
- [ ] 2.1 Create `app/api/chat/route.ts` using Vercel AI SDK's `streamText`
- [ ] 2.2 Configure OpenAI client with custom `baseURL` pointing to ShizhenGPT API
- [ ] 2.3 Add error handling for connection failures to backend
- [ ] 2.4 Test streaming with curl

## 3. Chat UI Components
- [ ] 3.1 Create `app/page.tsx` with chat layout
- [ ] 3.2 Use `useChat` hook from Vercel AI SDK
- [ ] 3.3 Add message list with user/assistant distinction
- [ ] 3.4 Add input form with submit button and Enter key support
- [ ] 3.5 Add loading indicator during streaming

## 4. Conversation Features
- [ ] 4.1 Display streaming tokens in real-time
- [ ] 4.2 Add "Clear conversation" button
- [ ] 4.3 Preserve conversation history in component state
- [ ] 4.4 Auto-scroll to latest message

## 5. Styling & UX
- [ ] 5.1 Apply Tailwind styles for clean, medical-professional look
- [ ] 5.2 Add responsive design for mobile screens
- [ ] 5.3 Style user messages (right-aligned) vs assistant (left-aligned)
- [ ] 5.4 Add subtle animations for message appearance

## 6. Testing & Documentation
- [ ] 6.1 Test multi-turn conversation flow
- [ ] 6.2 Test error states (backend offline, timeout)
- [ ] 6.3 Create `frontend/README.md` with setup instructions
- [ ] 6.4 Document environment variables
