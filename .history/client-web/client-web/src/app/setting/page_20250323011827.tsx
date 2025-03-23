"use client";
import { useEffect, useState } from "react";

interface Camera {
  id: number;
  name: string;
}

export default function CameraSettings() {
  // Token state
  const [token, setToken] = useState<string>("");
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  
  // Camera settings
  const [availableCameras, setAvailableCameras] = useState<Camera[]>([]);
  const [defaultCameraId, setDefaultCameraId] = useState<number>(0);
  const [isLoadingCameras, setIsLoadingCameras] = useState<boolean>(false);
  
  // Boundary settings
  const [boundaryEnabled, setBoundaryEnabled] = useState<boolean>(false);
  const [boundaryColor, setBoundaryColor] = useState<string>("#FF0000");
  const [boundaryThickness, setBoundaryThickness] = useState<number>(2);
  
  // Status message
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | null>(null);

  // Fetch available cameras when token is validated
  useEffect(() => {
    if (isTokenValid) {
      fetchAvailableCameras();
    }
  }, [isTokenValid]);

  const validateToken = async () => {
    if (!token.trim()) {
      setStatusMessage("Token không được để trống");
      setMessageType("error");
      return;
    }

    setIsValidating(true);
    setStatusMessage("Đang xác thực token...");
    setMessageType("info");

    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        setIsTokenValid(true);
        setStatusMessage("Token hợp lệ");
        setMessageType("success");
      } else {
        setIsTokenValid(false);
        setStatusMessage("Token không hợp lệ");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setIsTokenValid(false);
      setStatusMessage("Lỗi kết nối đến máy chủ");
      setMessageType("error");
    } finally {
      setIsValidating(false);
    }
  };

  const fetchAvailableCameras = async () => {
    if (!isTokenValid) return;

    setIsLoadingCameras(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/available-cameras', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convert the data to the expected format
        const cameras = data.available_cameras.map((id: number) => ({ 
          id, 
          name: `Camera ${id}` 
        }));
        
        setAvailableCameras(cameras);
        
        // If no default camera is set and cameras are available, set the first one as default
        if (defaultCameraId === 0 && cameras.length > 0) {
          setDefaultCameraId(cameras[0].id);
        }
      } else {
        setStatusMessage("Không thể tải danh sách camera");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setStatusMessage("Lỗi kết nối khi tải danh sách camera");
      setMessageType("error");
    } finally {
      setIsLoadingCameras(false);
    }
  };

  const saveSettings = async () => {
    if (!isTokenValid) {
      setStatusMessage("Vui lòng xác thực token trước");
      setMessageType("error");
      return;
    }

    setStatusMessage("Đang lưu cài đặt...");
    setMessageType("info");

    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/save-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          defaultCameraId,
          boundary: {
            enabled: boundaryEnabled,
            color: boundaryColor,
            thickness: boundaryThickness
          }
        })
      });

      if (response.ok) {
        setStatusMessage("Cài đặt đã được lưu thành công");
        setMessageType("success");
      } else {
        setStatusMessage("Không thể lưu cài đặt");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setStatusMessage("Lỗi kết nối khi lưu cài đặt");
      setMessageType("error");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Cài đặt Hệ thống Camera</h1>
          
          {/* Status message */}
          {statusMessage && (
            <div className={`mb-4 p-3 rounded-md ${
              messageType === 'success' ? 'bg-green-100 text-green-800' : 
              messageType === 'error' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {statusMessage}
            </div>
          )}
          
          {/* Section 1: Token Input */}
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <h2 className="text-lg font-semibold mb-3">1. Xác thực Token</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                className="flex-1 min-w-64 p-2 border border-gray-300 rounded-md"
                placeholder="Nhập token xác thực"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isValidating || isTokenValid}
              />
              <button
                className={`px-4 py-2 rounded-md ${
                  isTokenValid 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={validateToken}
                disabled={isValidating || isTokenValid}
              >
                {isValidating ? (
                  <>
                    <span className="inline-block animate-spin mr-2">↻</span>
                    Đang xác thực
                  </>
                ) : isTokenValid ? (
                  <>✓ Đã xác thực</>
                ) : (
                  <>Xác thực</>
                )}
              </button>
              {isTokenValid && (
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={() => {
                    setIsTokenValid(false);
                    setStatusMessage("");
                  }}
                >
                  Thay đổi
                </button>
              )}
            </div>
          </div>
          
          {/* Section 2: Default Camera Selection */}
          <div className={`mb-6 p-4 border border-gray-200 rounded-md ${!isTokenValid ? 'opacity-50' : ''}`}>
            <h2 className="text-lg font-semibold mb-3">2. Chọn Camera Mặc định</h2>
            <div className="mb-2">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={defaultCameraId}
                onChange={(e) => setDefaultCameraId(Number(e.target.value))}
                disabled={!isTokenValid || isLoadingCameras}
              >
                {isLoadingCameras ? (
                  <option value="">Đang tải danh sách camera...</option>
                ) : availableCameras.length === 0 ? (
                  <option value="">Không tìm thấy camera</option>
                ) : (
                  <>
                    <option value="0">Chọn camera mặc định</option>
                    {availableCameras.map(camera => (
                      <option key={camera.id} value={camera.id}>
                        {camera.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <p className="text-sm text-gray-600">
              Camera mặc định sẽ được kích hoạt tự động khi hệ thống khởi động.
            </p>
          </div>
          
          {/* Section 3: Boundary Settings */}
          <div className={`mb-6 p-4 border border-gray-200 rounded-md ${!isTokenValid ? 'opacity-50' : ''}`}>
            <h2 className="text-lg font-semibold mb-3">3. Thiết lập Đường Biên</h2>
            
            <div className="mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="boundaryEnabled"
                  className="mr-2 h-4 w-4"
                  checked={boundaryEnabled}
                  onChange={(e) => setBoundaryEnabled(e.target.checked)}
                  disabled={!isTokenValid}
                />
                <label htmlFor="boundaryEnabled" className="text-gray-800">
                  Kích hoạt đường biên
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu đường biên
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-gray-300 rounded"
                    value={boundaryColor}
                    onChange={(e) => setBoundaryColor(e.target.value)}
                    disabled={!isTokenValid || !boundaryEnabled}
                  />
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    value={boundaryColor}
                    onChange={(e) => setBoundaryColor(e.target.value)}
                    disabled={!isTokenValid || !boundaryEnabled}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ dày đường biên (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={boundaryThickness}
                  onChange={(e) => setBoundaryThickness(Number(e.target.value))}
                  disabled={!isTokenValid || !boundaryEnabled}
                />
              </div>
            </div>
            
            <div className="mt-3">
              <div className="p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">
                  Đường biên sẽ được hiển thị trên khung hình camera để đánh dấu vùng phát hiện chuyển động.
                </p>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={saveSettings}
              disabled={!isTokenValid}
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}