# Project Context

## Purpose
TCM diagnostic system providing AI-powered Traditional Chinese Medicine consultations through text and tongue image analysis. Uses ShizhenGPT (Qwen2.5-VL based model) for TCM-specific inference with local deployment for patient data privacy.

## Tech Stack

**Backend:**
- Python 3.10+
- FastAPI (REST API framework)
- PyTorch + Transformers (HuggingFace)
- ShizhenGPT-7B-VL (FreedomIntelligence/ShizhenGPT)
- qwen-vl-utils (vision preprocessing)

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Vercel AI SDK (streaming inference)
- Tailwind CSS
- MediaDevices API (camera capture)

**Infrastructure:**
- Localhost-only deployment (no cloud dependencies)
- CUDA GPU optional (CPU fallback supported)
- Minimum 16GB RAM recommended (14GB model + inference overhead)

## Project Conventions

### Code Style
- **Python:** PEP 8, Black formatter, type hints required
- **TypeScript:** Strict mode enabled, ESLint + Prettier
- **React:** Functional components, hooks-based state management
- **Naming:** Kebab-case for files/directories, camelCase for JS/TS, snake_case for Python

### Architecture Patterns
- **Backend:** Single-file FastAPI server (`backend/server.py`), lazy model loading, stateless API
- **Frontend:** Next.js App Router conventions, Server Components for static content, Client Components for interactivity
- **API Design:** OpenAI-compatible format for text inference, multipart/form-data for vision
- **State Management:** React hooks (`useChat` from Vercel AI SDK), no external state libraries
- **Data Flow:** Browser → Next.js API routes → FastAPI backend → ShizhenGPT model

### Testing Strategy
- **Backend:** Manual testing with curl/Postman for MVP, pytest for future expansion
- **Frontend:** Browser testing on Chrome/Safari (desktop), Chrome/Safari (mobile iOS/Android)
- **Model Validation:** Sample inference tests with known TCM queries and tongue images
- **Error Scenarios:** Test camera permission denial, backend offline, OOM conditions

### Git Workflow
- Main branch: `main` (production-ready code)
- Feature branches: Use OpenSpec change IDs as branch names (e.g., `deploy-shizhengpt-model`)
- Commits: Conventional commits format (`feat:`, `fix:`, `docs:`)
- OpenSpec workflow: Create proposal → get approval → implement → archive after deployment

## Domain Context

### Traditional Chinese Medicine (TCM)
- **Four Diagnostics (四诊):** Observation (望诊), listening/smelling (闻诊), inquiry (问诊), palpation (切诊)
- **Tongue Diagnosis (舌诊):** Part of 望诊, analyzes tongue color, coating, shape, moisture to assess organ health and qi/blood balance
- **Key Concepts:** Yin/Yang balance, Five Elements (五行), Qi (气), meridians (经络)
- **ShizhenGPT Training:** Model fine-tuned on TCM medical texts and diagnostic cases, understands TCM terminology in Chinese

### Medical Privacy
- Patient data must stay local (no cloud API calls)
- Images not stored persistently (session-only)
- Localhost-only deployment (no external network access)

## Important Constraints

### Hardware Requirements
- **Minimum RAM:** 16GB (14GB model + 2GB inference overhead)
- **GPU (Optional):** 8GB+ VRAM for faster inference (5-10s vs 30-60s CPU)
- **Storage:** 20GB free space (model weights + cache)
- **Network:** Internet required for initial model download from HuggingFace (~14GB)

### Software Constraints
- Python 3.10+ (for transformers library compatibility)
- CUDA 11.8+ if using GPU
- Modern browser with MediaDevices API support (no IE11)
- HTTPS or localhost required for camera access

### Medical/Legal Constraints
- **Disclaimer:** System provides educational TCM insights, not medical diagnosis
- **Liability:** Users must consult licensed TCM practitioners for treatment
- **Data Retention:** No conversation or image persistence (privacy-by-design)

### Performance Constraints
- Text inference: 2-5s (GPU), 10-30s (CPU)
- Vision inference: 5-10s (GPU), 30-60s (CPU)
- Model loading: 30-60s on first request
- Max conversation length: 50 messages (memory limit)

## External Dependencies

### Model Source
- **HuggingFace Model Hub:** FreedomIntelligence/ShizhenGPT-7B-VL
- **License:** Check model card for usage restrictions
- **Fallback:** Model must be downloaded and cached locally on first run

### Browser APIs
- **MediaDevices API:** Camera access (requires HTTPS or localhost)
- **Canvas API:** Image capture from video stream
- **File API:** Image file upload fallback
- **Fetch API:** Multipart form submission

### Python Packages
- `transformers==4.51.0` (HuggingFace models)
- `torch>=2.0.0` (PyTorch for inference)
- `qwen-vl-utils` (Qwen vision preprocessing)
- `fastapi`, `uvicorn`, `python-multipart`

### Node Packages
- `next@15`, `react@19`, `react-dom@19`
- `ai` (Vercel AI SDK core)
- `@ai-sdk/openai` (OpenAI-compatible provider)
- `tailwindcss`, `autoprefixer`, `postcss`

### Development Tools
- OpenSpec CLI (spec-driven development)
- Black (Python formatting)
- Prettier + ESLint (TypeScript/React)
