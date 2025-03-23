"use client";
import { useEffect, useState } from "react";

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
    <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto">
      <div className="card-body">
        <h2 className="card-title justify-center">Live Webcam Stream</h2>
        
        <div className="relative w-full mt-4">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt="Live Stream" 
              className="w-full h-auto rounded-lg shadow-lg" 
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
              <span className="loading loading-spinner loading-md mr-2"></span>
              <p>Đang kết nối...</p>
            </div>
          )}
        </div>
        
        <div className="card-actions justify-center mt-4">
          <button
            onClick={sendCurrentFrameToAPI}
            disabled={!imageSrc || isSending}
            className="btn btn-primary"
          >
            {isSending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Đang gửi...
              </>
            ) : (
              "Gửi khung hình hiện tại"
            )}
          </button>
        </div>
        
        {sendSuccess && (
          <div className="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Khung hình đã được gửi thành công!</span>
          </div>
        )}
      </div>
    </div>
  );
}