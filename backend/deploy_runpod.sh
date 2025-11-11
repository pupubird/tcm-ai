#!/bin/bash
# RunPod Deployment Script for ShizhenGPT-32B-VL

set -e  # Exit on error

echo "🚀 Starting RunPod deployment..."

# Configuration
POD_SSH="root@38.128.232.104 -p 35654"
SSH_KEY="$HOME/.ssh/id_rsa"
REMOTE_DIR="/workspace/shizhengpt"

echo "📦 Creating deployment package..."
cd "$(dirname "$0")"

# Create temporary deployment directory
mkdir -p /tmp/shizhengpt_deploy
cp server.py /tmp/shizhengpt_deploy/
cp requirements.txt /tmp/shizhengpt_deploy/

echo "📤 Uploading files to RunPod..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no -p 35654 root@38.128.232.104 "mkdir -p $REMOTE_DIR"
scp -i $SSH_KEY -o StrictHostKeyChecking=no -P 35654 /tmp/shizhengpt_deploy/* root@38.128.232.104:$REMOTE_DIR/

echo "📥 Installing dependencies..."
ssh -i $SSH_KEY -p 35654 root@38.128.232.104 << 'ENDSSH'
cd /workspace/shizhengpt

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "✓ Dependencies installed"
ENDSSH

echo "🔥 Starting FastAPI server..."
ssh -i $SSH_KEY -p 35654 root@38.128.232.104 << 'ENDSSH'
cd /workspace/shizhengpt

# Kill existing server if running
pkill -f "uvicorn server:app" || true

# Start server in background with nohup
nohup python -u server.py > server.log 2>&1 &

echo "✓ Server started in background"
echo "   Log file: /workspace/shizhengpt/server.log"
echo "   PID: $!"
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your API will be available at:"
echo "   https://3wzca59jx2ytll-8000.proxy.runpod.net"
echo ""
echo "📊 Monitor server logs:"
echo "   ssh -i $SSH_KEY -p 35654 root@38.128.232.104 'tail -f /workspace/shizhengpt/server.log'"
echo ""
echo "🧪 Test health endpoint:"
echo "   curl https://3wzca59jx2ytll-8000.proxy.runpod.net/health"
echo ""
echo "⏳ Note: First startup takes 15-20 minutes to download the 64GB model"

# Cleanup
rm -rf /tmp/shizhengpt_deploy
