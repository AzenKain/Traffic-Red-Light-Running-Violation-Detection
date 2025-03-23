"use client";
import { useEffect, useState } from "react";
import { Send, RefreshCw, Check } from "lucide-react";

export default function VideoStream() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      setImageSrc(`data:image/jpeg;base64,${event.data}`);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendCurrentFrameToAPI = async () => {
    if (!imageSrc) return;

    try {
      setIsSending(true);
      // Xử lý base64 string để gửi đi
      const base64Data = imageSrc.split(',')[1];
      
      const response = await fetch('https://your-api-endpoint.com/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      });
      
      if (response.ok) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
      } else {
        console.error('Failed to send image to API');
      }
    } catch (error) {
      console.error('Error sending image:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto p-6 bg-gray-50 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Live Webcam Stream</h2>
      
      <div className="relative w-full rounded-lg overflow-hidden bg-black">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Live Stream" 
            className="w-full h-auto object-contain rounded-lg shadow-lg" 
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-800 text-white">
            <RefreshCw className="animate-spin mr-2" size={20} />
            <p>Connecting to stream...</p>
          </div>
        )}
      </div>
      
      <div className="flex mt-6">
        <button
          onClick={sendCurrentFrameToAPI}
          disabled={!imageSrc || isSending}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={20} />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="mr-2" size={20} />
              Gửi khung hình hiện tại
            </>
          )}
        </button>
      </div>
      
      {sendSuccess && (
        <div className="mt-4 flex items-center p-2 bg-green-100 text-green-800 rounded">
          <Check size={16} className="mr-2" />
          Khung hình đã được gửi thành công!
        </div>
      )}
    </div>
  );
}