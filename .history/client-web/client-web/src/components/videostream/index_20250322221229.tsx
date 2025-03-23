"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Download, RefreshCw, Check } from "lucide-react";

export default function VideoStream() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
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

  const captureImage = () => {
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCapturing(true);
    }
  };

  const sendImageToAPI = async () => {
    if (!capturedImage) return;

    try {
      setIsSending(true);
      // Xử lý base64 string để gửi đi
      const base64Data = capturedImage.split(',')[1];
      
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
      setIsCapturing(false);
    }
  };

  const cancelCapture = () => {
    setIsCapturing(false);
    setCapturedImage(null);
  };

  const downloadImage = () => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `captured-image-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto p-6 bg-gray-50 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Live Webcam Stream</h2>
      
      <div className="relative w-full rounded-lg overflow-hidden bg-black">
          { imageSrc ? (<Image 
            src={isCapturing ? capturedImage || "" : imageSrc || ""} 
            alt="Live Stream" 
            className="w-full h-auto object-contain"
            width={800} 
            height={600} 
          />
     
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-800 text-white">
            <RefreshCw className="animate-spin mr-2" size={20} />
            <p>Connecting to stream...</p>
          </div>
        )}
        
        {isCapturing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <p className="text-gray-800 mb-4 font-medium">Bạn muốn làm gì với ảnh đã chụp?</p>
              <div className="flex gap-2">
                <button 
                  onClick={sendImageToAPI}
                  disabled={isSending}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2" size={16} />
                      Gửi ảnh
                    </>
                  )}
                </button>
                <button 
                  onClick={downloadImage}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Download className="mr-2" size={16} />
                  Tải xuống
                </button>
                <button 
                  onClick={cancelCapture}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex mt-6 gap-4">
        <button
          onClick={captureImage}
          disabled={!imageSrc || isCapturing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="mr-2" size={20} />
          Chụp ảnh
        </button>
      </div>
      
      {sendSuccess && (
        <div className="mt-4 flex items-center p-2 bg-green-100 text-green-800 rounded">
          <Check size={16} className="mr-2" />
          Ảnh đã được gửi thành công!
        </div>
      )}
    </div>
  );
}