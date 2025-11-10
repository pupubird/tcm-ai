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
      content: 'Tongue Image / 舌苔照片',
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
          content: data.diagnosis || 'Unable to analyze image',
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 sm:px-6 py-3 bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-900">TCM Consultation</h1>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-5xl mb-4">🏥</div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Welcome</h2>
              <p className="text-sm sm:text-base text-gray-600">Describe your symptoms for Traditional Chinese Medicine consultation</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-lg px-3 sm:px-4 py-2 sm:py-3 ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Tongue"
                    className="rounded-lg mb-2 max-w-full h-auto border border-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                )}
                <div className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md text-sm sm:text-base">
                <p className="font-semibold">Connection Error</p>
                <p className="text-sm mt-1">Unable to connect to server</p>
                <p className="text-xs mt-1 opacity-75">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Image Preview */}
          {imagePreviewUrl && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreviewUrl}
                alt="Captured tongue"
                className="rounded-lg max-h-32 sm:max-h-40 max-w-full h-auto border border-gray-200"
              />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              disabled={isLoading}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-h-[44px]"
              title="Capture Tongue Image"
              aria-label="Open camera"
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
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Tongue'}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-sm sm:text-base min-h-[44px]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  {isLoading ? 'Sending...' : 'Send'}
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
              className="mt-3 text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Clear Conversation
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
