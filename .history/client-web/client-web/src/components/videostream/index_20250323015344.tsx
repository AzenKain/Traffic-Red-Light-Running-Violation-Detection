"use client";
import { useEffect, useState } from "react";

interface Camera {
  id: number;
}

export default function VideoStream() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // Fetch available cameras
  useEffect(() => {
    fetchDefaultCamera();
    fetchCameras();
  }, []);

  const fetchDefaultCamera = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/default-camera');
      
      if (response.ok) {
        const data = await response.json();
        setSelectedCamera(Number(data.default_camera));
      } else {
        setSelectedCamera(0);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:8000/available-cameras');
      const data = await response.json();
      const cameras = data.available_cameras.map((id: number) => ({ id }));
      
      setAvailableCameras(cameras);
      if (cameras.length > 0 && selectedCamera === -1) {
        setSelectedCamera(cameras[0].id);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Connect to WebSocket with selected camera
  useEffect(() => {
    // Đóng WebSocket cũ nếu có
    if (websocket) {
      websocket.close();
      setWebsocket(null);
      setImageSrc(null);
    }
    if (selectedCamera === -1) return

    const ws = new WebSocket(`ws://localhost:8000/ws?camera_id=${selectedCamera}`);
    setWebsocket(ws);

    ws.onopen = () => {
      console.log(`WebSocket connected to camera ${selectedCamera}`);
    };

    ws.onmessage = (event) => {
      setImageSrc(`data:image/jpeg;base64,${event.data}`);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [selectedCamera]);

  const downloadCurrentFrame = () => {
    if (!imageSrc) return;
    
    try {
      setIsDownloading(true);
      
      // Tạo tên file với timestamp và camera ID
      const fileName = `camera-${selectedCamera}-${new Date().getTime()}.jpg`;
      
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

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(Number(e.target.value));
  };

  return (
    <div className="card bg-base-100 shadow-xl  max-w-3xl my-2 mx-auto">
      <div className="card-body">
        <h2 className="card-title justify-center">Live Webcam Stream</h2>
        
        {/* Camera selector and download button in the same row */}
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <label className="label">
              <span className="label-text mb-2">Chọn camera</span>
            </label>
            <select 
              className="select select-bordered w-full" 
              value={selectedCamera}
              onChange={handleCameraChange}
              disabled={isLoading || availableCameras.length === 0}
            >
              {isLoading ? (
                <option value="">Đang tải danh sách camera...</option>
              ) : availableCameras.length === 0 ? (
                <option value="">Không tìm thấy camera</option>
              ) : (
                availableCameras.map(camera => (
                  <option key={camera.id} value={camera.id}>
                    Camera {camera.id}
                  </option>
                ))
              )}
            </select>
          </div>
          
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
        
        {/* Success notification */}
        {downloadSuccess && (
          <div className="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Khung hình đã được tải xuống thành công!</span>
          </div>
        )}
        
        {/* Video stream */}
        <div className="relative w-full mt-4">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt="Live Stream" 
              className="w-full h-auto rounded-lg shadow-lg" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-base-200 rounded-lg">
              <span className="loading loading-spinner loading-md mb-2"></span>
              <p>{availableCameras.length === 0 ? "Không tìm thấy camera" : "Đang kết nối..."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}