"use client";
import { useEffect, useState } from "react";

export default function VideoStream() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  const downloadCurrentFrame = () => {
    if (!imageSrc) return;
    
    try {
      setIsDownloading(true);
      
      // Tạo tên file với timestamp
      const fileName = `webcam-capture-${new Date().getTime()}.jpg`;
      
      // Tạo một thẻ a tạm thời để tải xuống
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = fileName;
      document.body.appendChild(link);
      
      // Kích hoạt sự kiện click để tải xuống
      link.click();
      
      // Dọn dẹp
      document.body.removeChild(link);
      
      // Hiển thị thông báo thành công
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
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
            onClick={downloadCurrentFrame}
            disabled={!imageSrc || isDownloading}
            className="btn btn-primary"
          >
            {isDownloading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Đang tải xuống...
              </>
            ) : (
              "Tải xuống khung hình hiện tại"
            )}
          </button>
        </div>
        
        {downloadSuccess && (
          <div className="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Khung hình đã được tải xuống thành công!</span>
          </div>
        )}
      </div>
    </div>
  );
}