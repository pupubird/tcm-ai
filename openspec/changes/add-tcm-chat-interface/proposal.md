# Proposal: Add TCM Chat Interface

## Why
Users need a web interface to interact with ShizhenGPT for TCM consultations. A simple localhost chat UI enables text-based symptom queries with streaming responses, providing immediate feedback during model inference.

## What Changes
- Add Next.js 15 App Router chat interface
- Integrate Vercel AI SDK for streaming responses from local ShizhenGPT API
- Implement conversation history in browser (no backend persistence)
- Add responsive UI with Tailwind CSS for desktop/mobile
- Support both single-turn queries and multi-turn conversations

## Impact
- **Affected specs**: `chat-ui` (new capability)
- **Affected code**: New Next.js app in `frontend/` directory
- **Dependencies**: `next@15`, `react@19`, `ai`, `@ai-sdk/openai`, `tailwindcss`
- **Requires**: `model-inference` capability from `deploy-shizhengpt-model` change
