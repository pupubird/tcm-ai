# ShizhenGPT-32B-VL Backend

Traditional Chinese Medicine AI diagnostic system powered by ShizhenGPT-32B-VL model deployed on RunPod A100 80GB.

## 🚀 Quick Start

### RunPod Instance Details
- **Pod Name**: `troubled_gold_jackal`
- **Pod ID**: `3wzca59jx2ytll`
- **GPU**: A100 PCIe 80GB
- **API Endpoint**: `https://3wzca59jx2ytll-8000.proxy.runpod.net`
- **SSH**: `ssh root@38.128.232.104 -p 35654`

### API Documentation

Once the model is loaded (15-20 minutes after first start), the API provides:

#### 1. Health Check
```bash
curl https://3wzca59jx2ytll-8000.proxy.runpod.net/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "ShizhenGPT-32B-VL",
  "device": "cuda:0",
  "vram": {
    "allocated_gb": 72.34,
    "reserved_gb": 74.56,
    "total_gb": 80.0,
    "utilization_percent": 90.43
  }
}
```

#### 2. Text Chat Completions (OpenAI-compatible)
```bash
curl -X POST https://3wzca59jx2ytll-8000.proxy.runpod.net/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "手脚冰凉，经常怕冷，是什么原因？"}
    ],
    "max_tokens": 512,
    "temperature": 0.7
  }'
```

Response:
```json
{
  "id": "chatcmpl-shizhengpt",
  "object": "chat.completion",
  "model": "ShizhenGPT-32B-VL",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "从中医角度来看，手脚冰凉、经常怕冷多与阳虚有关..."
    },
    "finish_reason": "stop"
  }]
}
```

#### 3. Tongue Image Analysis
```bash
# Encode image to base64
IMAGE_BASE64=$(base64 -i tongue.jpg)

curl -X POST https://3wzca59jx2ytll-8000.proxy.runpod.net/v1/vision/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,'$IMAGE_BASE64'",
    "question": "请从中医角度解读这张舌苔。",
    "max_tokens": 1024
  }'
```

Response:
```json
{
  "analysis": "舌质淡红，舌苔薄白，舌体胖大有齿痕...",
  "question": "请从中医角度解读这张舌苔。",
  "model": "ShizhenGPT-32B-VL"
}
```

#### 4. List Models
```bash
curl https://3wzca59jx2ytll-8000.proxy.runpod.net/v1/models
```

## 📂 File Structure

```
backend/
├── server.py              # FastAPI application
├── requirements.txt       # Python dependencies
├── deploy_runpod.sh       # Automated deployment script
├── DEPLOYMENT.md          # Detailed deployment guide
└── README.md              # This file
```

## 🔧 Development

### Local Testing (Mock)
The 32B model requires 70-75GB VRAM and cannot run locally on MacBook. For local development, use the API endpoint.

### Monitoring Server
```bash
# View logs
ssh root@38.128.232.104 -p 35654 'tail -f /workspace/shizhengpt/server.log'

# Check process
ssh root@38.128.232.104 -p 35654 'ps aux | grep python'

# Check VRAM usage
ssh root@38.128.232.104 -p 35654 'nvidia-smi'
```

### Restarting Server

**Standard restart** (when dependencies are already installed):
```bash
ssh root@38.128.232.104 -p 35654 << 'EOF'
cd /workspace/shizhengpt
pkill -f "python.*server.py"
nohup python -u server.py > server.log 2>&1 &
EOF
```

**Full restart** (after pod restart or missing dependencies):
```bash
ssh root@38.128.232.104 -p 35654 << 'EOF'
cd /workspace/shizhengpt

# Install dependencies if missing
pip install --break-system-packages -r requirements.txt

# Restart server
pkill -f "python.*server.py"
nohup python -u server.py > server.log 2>&1 &

# Verify process started
sleep 2
ps aux | grep "python.*server.py" | grep -v grep
EOF
```

**Verify server is ready**:
```bash
# Check loading progress
ssh root@38.128.232.104 -p 35654 'tail -f /workspace/shizhengpt/server.log'

# Test health endpoint (wait 2-3 minutes for model to load)
curl https://3wzca59jx2ytll-8000.proxy.runpod.net/health
```

Expected output after model loads (2-3 minutes):
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "ShizhenGPT-32B-VL",
  "device": "cuda:0",
  "vram": {
    "allocated_gb": 66.91,
    "reserved_gb": 68.47,
    "total_gb": 85.1,
    "utilization_percent": 78.63
  }
}
```

## 💰 Cost Management

### Pricing
- **GPU Cost**: $1.64/hr
- **Storage Cost**: $0.018/hr (100GB persistent volume)
- **Total Running**: $1.658/hr (~$40/day if running 24/7)
- **Total Stopped**: $0.028/hr (storage only, ~$0.67/day)

### Cost Optimization
**Stop pod when not in use** to save 98% on compute costs:

```bash
# Via SSH
ssh root@38.128.232.104 -p 35654 'shutdown -h now'

# Or use RunPod dashboard
# Click "Stop" button on pod page
```

**Estimated costs:**
- 8 hours/day usage: $13.12/day
- 24/7 usage: $39.36/day
- Testing phase (8hrs/day, 2 weeks): $184

## 🐛 Troubleshooting

### Model Not Loading
Check logs for download progress:
```bash
ssh root@38.128.232.104 -p 35654 'tail -f /workspace/shizhengpt/server.log'
```

First download takes 15-20 minutes. Look for:
```
Fetching 14 files: 100%|██████████| 14/14 [18:32<00:00, 79.43s/it]
✓ Model loaded successfully
✓ Device: cuda:0
✓ VRAM allocated: 72.34 GB
```

### Out of Memory Error
Edit `/workspace/shizhengpt/server.py` line 121:
```python
max_memory={0: "70GB"}  # Reduce from 75GB
```

Then restart server.

### Connection Timeout
RunPod proxy needs 2-3 minutes after server starts to expose port 8000. Wait and retry.

### Port 8000 Not Ready
Check if server is listening:
```bash
ssh root@38.128.232.104 -p 35654 'netstat -tlnp | grep 8000'
```

Should show:
```
tcp        0      0 0.0.0.0:8000            0.0.0.0:*               LISTEN      2244/python
```

## 📊 Performance

### Expected Latency
- **Text queries**: 1-3 seconds
- **Vision analysis**: 3-6 seconds
- **Model loading**: 15-20 minutes (first time only)

### VRAM Usage
- **Model weights**: ~64GB
- **Inference overhead**: ~6-8GB
- **Total**: ~70-75GB / 80GB available

## 🔐 Security Notes

- API has no authentication (trust-based for MVP)
- CORS allows all origins (restrict in production)
- Running as root user (containerized environment)

For production deployment, add:
- JWT authentication
- Rate limiting (Redis)
- Request logging
- HTTPS certificate pinning

## 📚 Resources

- **Model**: [FreedomIntelligence/ShizhenGPT-32B-VL](https://huggingface.co/FreedomIntelligence/ShizhenGPT-32B-VL)
- **Paper**: [ShizhenGPT: Medical Large Language Model for Traditional Chinese Medicine](https://arxiv.org/abs/2403.08998)
- **RunPod Docs**: https://docs.runpod.io/
- **FastAPI Docs**: https://fastapi.tiangolo.com/

## 🤝 Integration

### Frontend Integration (Next.js)
```typescript
// Frontend .env.local
NEXT_PUBLIC_API_URL=https://3wzca59jx2ytll-8000.proxy.runpod.net

// API client
export async function chatCompletion(messages: Message[]) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, max_tokens: 512, temperature: 0.7 })
  });
  return response.json();
}
```

### Vercel AI SDK Integration
```typescript
import { openai } from '@ai-sdk/openai';

const customProvider = openai.provider({
  baseURL: 'https://3wzca59jx2ytll-8000.proxy.runpod.net/v1'
});

const result = await generateText({
  model: customProvider('ShizhenGPT-32B-VL'),
  prompt: '手脚冰凉，经常怕冷，是什么原因？'
});
```

## 📝 License

This implementation is MIT licensed. ShizhenGPT model follows its own license terms.
