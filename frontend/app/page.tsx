'use client';

import { useState, useEffect, useRef } from 'react';
import CameraCapture from '../components/CameraCapture';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending request with messages:', [...messages, userMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `chat_${Date.now()}`,
          messages: [...messages, userMessage]
        })
      });

      console.log('Response status:', response.status, response.ok);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      console.log('Setting messages to:', data.messages);

      setMessages(data.messages || []);
      console.log('Messages state updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      console.error('Chat error:', err);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleCameraCapture = (blob: Blob) => {
    setCapturedImage(blob);
    const url = URL.createObjectURL(blob);
    setImagePreviewUrl(url);
    setShowCamera(false);
  };

  const handleImageSubmit = async () => {
    if (!capturedImage || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: '舌苔照片 / Tongue Image',
      imageUrl: imagePreviewUrl || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', capturedImage);

      const response = await fetch('/api/vision', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status}`);
      }

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.diagnosis || '无法分析舌苔图片',
          id: `msg_${Date.now()}`
        }
      ]);

      // Clear image after successful submission
      setCapturedImage(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      console.error('Vision error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-emerald-800">神针GPT 中医咨询</h1>
          <p className="text-sm text-emerald-600 mt-1">ShizhenGPT Traditional Chinese Medicine Consultation</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏥</div>
              <h2 className="text-xl font-semibold text-emerald-800 mb-2">欢迎使用神针GPT</h2>
              <p className="text-emerald-600">请描述您的症状，我将为您提供中医诊疗建议</p>
              <p className="text-sm text-emerald-500 mt-2">Please describe your symptoms for TCM consultation</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-800 border border-emerald-100'
                }`}
              >
                <div className="text-xs font-semibold mb-1 opacity-70">
                  {message.role === 'user' ? '您' : '神针GPT'}
                </div>
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Tongue"
                    className="rounded-lg mb-2 max-w-sm"
                  />
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-emerald-100 shadow-sm">
                <div className="text-xs font-semibold mb-1 text-gray-500">神针GPT</div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
                <p className="font-semibold">连接错误 / Connection Error</p>
                <p className="text-sm mt-1">无法连接到服务器，请确认后端服务正在运行</p>
                <p className="text-xs mt-1 opacity-75">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-emerald-200 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {imagePreviewUrl && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreviewUrl}
                alt="Captured tongue"
                className="rounded-lg max-h-40 border-2 border-emerald-200"
              />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              disabled={isLoading}
              className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              title="拍摄舌苔 / Capture Tongue"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {capturedImage ? (
              <button
                type="button"
                onClick={handleImageSubmit}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '分析中...' : '分析舌苔 / Analyze Tongue'}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请描述您的症状... (例如：手脚冰凉，经常怕冷)"
                  className="flex-1 px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '发送中...' : '发送'}
                </button>
              </>
            )}
          </form>

          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                setError(null);
                clearImage();
              }}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              清空对话 / Clear Conversation
            </button>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
