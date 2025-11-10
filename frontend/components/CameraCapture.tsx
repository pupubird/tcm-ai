'use client';

import { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [captured, setCaptured] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error('Camera access error:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        setCaptured(true);
        stopCamera();
        onCapture(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const retake = () => {
    setCaptured(false);
    startCamera();
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3 flex justify-between items-center bg-white">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Capture Tongue Image</h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-gray-900 aspect-video">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-red-500 text-3xl sm:text-4xl mb-4">⚠️</div>
                <p className="text-white text-base sm:text-lg mb-2">Camera Access Failed</p>
                <p className="text-gray-300 text-xs sm:text-sm mb-4 px-4">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: captured ? 'none' : 'block' }}
              />
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
                style={{ display: captured ? 'block' : 'none' }}
              />

              {/* Capture Guide Overlay */}
              {!captured && !error && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-36 sm:h-48 border-2 border-white rounded-lg opacity-60"></div>
                  <div className="absolute top-3 sm:top-4 left-0 right-0 text-center px-4">
                    <p className="text-white text-xs sm:text-sm bg-black bg-opacity-60 inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                      Align tongue in frame
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        {!error && (
          <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
            {/* Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs sm:text-sm text-gray-700">
              <p className="font-semibold mb-2">💡 Tips:</p>
              <ul className="space-y-1">
                <li>• Use bright, natural light</li>
                <li>• Extend tongue, hold still</li>
                <li>• Avoid shadows on tongue</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 justify-center">
              {!captured ? (
                <>
                  <button
                    onClick={toggleCamera}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
                    aria-label="Toggle camera"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Flip</span>
                  </button>
                  <button
                    onClick={capture}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-lg flex items-center gap-2 min-h-[44px]"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capture
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={retake}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base min-h-[44px]"
                  >
                    Retake
                  </button>
                  <button
                    onClick={() => {
                      stopCamera();
                      onClose();
                    }}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base min-h-[44px]"
                  >
                    Use Photo
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
