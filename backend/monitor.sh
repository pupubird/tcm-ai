#!/bin/bash
# Monitor ShizhenGPT server on RunPod

echo "🔍 Monitoring ShizhenGPT Server"
echo "================================"
echo ""

# Check if server is running
ssh root@38.128.232.104 -p 35654 'ps aux | grep "python.*server.py" | grep -v grep' && {
    echo "✅ Server process is running"
} || {
    echo "❌ Server process not found"
    exit 1
}

echo ""
echo "📊 Latest log output:"
echo "--------------------"
ssh root@38.128.232.104 -p 35654 'tail -30 /workspace/shizhengpt/server.log'

echo ""
echo "💾 Disk usage:"
echo "-------------"
ssh root@38.128.232.104 -p 35654 'df -h / /workspace | tail -2'

echo ""
echo "🎮 GPU usage:"
echo "-------------"
ssh root@38.128.232.104 -p 35654 'nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv'

echo ""
echo "🌐 API Endpoint: https://3wzca59jx2ytll-8000.proxy.runpod.net"
echo ""
echo "💡 To follow logs in real-time:"
echo "   ssh root@38.128.232.104 -p 35654 'tail -f /workspace/shizhengpt/server.log'"
