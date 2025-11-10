# Design: Tongue Image Diagnosis

## Context
TCM tongue diagnosis (舌诊) analyzes tongue color, coating, shape, and moisture to assess patient health. Users need to capture tongue photos using device cameras or upload existing images. The backend ShizhenGPT-VL model performs multimodal inference combining image and text query.

**Constraints:**
- Browser MediaDevices API requires HTTPS or localhost
- Image size affects inference latency (~5-10s for large images)
- Mobile front camera is ideal for self-capture tongue photos

## Goals / Non-Goals

**Goals:**
- One-tap camera capture from chat interface
- Seamless integration into conversation flow (image as message)
- Support both live capture and file upload
- Mobile-first design (front camera default)

**Non-Goals:**
- Image editing or filters (send raw capture)
- Multiple image upload per message (one image at a time)
- Image annotation or markup tools
- Historical tongue image comparison

## Decisions

### Decision 1: MediaDevices API over Third-Party Libraries
**Rationale:** Native browser API, no dependencies, full control

**Alternatives considered:**
- `react-webcam`: Adds 50KB bundle, just a wrapper around MediaDevices
- `html5-qrcode`: Designed for QR codes, overkill

**Implementation:**
```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user" } // Front camera for selfies
});
```

### Decision 2: Separate Vision API Route (Not Merged with Chat)
**Rationale:** Different request format (multipart vs JSON), different backend endpoint

**File:** `app/api/vision/route.ts` → calls backend `/v1/vision/analyze`

**Trade-off:** Two API routes instead of one, but cleaner separation of concerns

### Decision 3: Display Image in Chat Thread
**Rationale:** Maintain conversation context, images are part of medical history

**Implementation:**
- User message shows thumbnail of captured image
- Assistant message shows diagnosis text below
- Both are part of `messages` array managed by `useChat`

**Alternative considered:** Separate "Tongue Analysis" tab → Rejected, breaks conversation flow

### Decision 4: Front Camera Default on Mobile
**Rationale:** Users capture their own tongues (selfie style)

**Configuration:**
```typescript
{ video: { facingMode: "user" } } // Not "environment" (back camera)
```

Add toggle for users who prefer back camera with mirror/selfie stick.

## Implementation Pattern

**Component structure:**
```
frontend/
├── components/
│   ├── CameraCapture.tsx      # Camera modal
│   └── ImagePreview.tsx       # Thumbnail display
├── app/
│   ├── api/
│   │   └── vision/
│   │       └── route.ts       # Vision API proxy
│   └── page.tsx               # Main chat (add camera button)
```

**Key code pattern (CameraCapture.tsx):**
```typescript
const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 1280, height: 720 }
    });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => onCapture(blob), 'image/jpeg', 0.9);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={capture}>Capture</button>
    </div>
  );
};
```

**Key code pattern (app/api/vision/route.ts):**
```typescript
export async function POST(req: Request) {
  const formData = await req.formData();
  const image = formData.get('image') as File;

  const backendForm = new FormData();
  backendForm.append('image', image);
  backendForm.append('query', '请从中医角度解读这张舌苔。');

  const res = await fetch(`${process.env.SHIZHENGPT_API_URL}/v1/vision/analyze`, {
    method: 'POST',
    body: backendForm
  });

  return Response.json(await res.json());
}
```

## Risks / Trade-offs

**Risk 1: Camera permission denial**
- **Mitigation:** Show clear prompt explaining why camera is needed, provide file upload fallback

**Risk 2: Large image causing slow inference**
- **Mitigation:** Resize to max 1024x1024 client-side before upload, show "Analyzing image..." message

**Risk 3: Poor lighting affecting diagnosis quality**
- **Mitigation:** Display lighting tips ("Use bright, natural light") before capture

**Risk 4: Privacy concerns with camera access**
- **Mitigation:** Localhost-only deployment, no image storage, clear data handling notice

## Migration Plan
This modifies the existing `chat-ui` capability. Changes are additive (new components, new API route), no breaking changes to existing text chat.

**Rollout:**
1. Deploy vision API route
2. Add camera button to UI (hidden behind feature flag initially)
3. Test on mobile devices
4. Enable for all users

## Open Questions
1. Should we support multiple images per consultation?
   - **Answer:** No for MVP, single image per message is sufficient
2. Image compression quality setting (0.9 JPEG)?
   - **Answer:** 0.9 is good balance (high quality, reasonable size)
3. Store images in conversation history across refreshes?
   - **Answer:** No, consistent with text chat (no persistence in MVP)
