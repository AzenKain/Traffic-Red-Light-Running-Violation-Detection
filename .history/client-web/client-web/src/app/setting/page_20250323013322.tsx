"use client";
import { useEffect, useState } from "react";

interface Camera {
  id: number;
  name: string;
}

export default function CameraSettings() {
  // Token state
  const [token, setToken] = useState<string>("");
  const [tokenStatus, setTokenStatus] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  
  // Camera settings
  const [availableCameras, setAvailableCameras] = useState<Camera[]>([]);
  const [defaultCameraId, setDefaultCameraId] = useState<number>(0);
  const [isLoadingCameras, setIsLoadingCameras] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<string>("");
  
  // Boundary settings
  const [boundaryEnabled, setBoundaryEnabled] = useState<boolean>(false);
  const [boundaryColor, setBoundaryColor] = useState<string>("#FF0000");
  const [boundaryThickness, setBoundaryThickness] = useState<number>(2);
  const [boundaryStatus, setBoundaryStatus] = useState<string>("");

  // Fetch available cameras on component mount
  useEffect(() => {
    fetchAvailableCameras();
  }, []);

  const validateToken = async () => {
    if (!token.trim()) {
      setTokenStatus("Token không được để trống");
      return;
    }

    setIsValidating(true);
    setTokenStatus("Đang xác thực token...");

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
        setTokenStatus("Token hợp lệ");
      } else {
        setTokenStatus("Token không hợp lệ");
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenStatus("Lỗi kết nối đến máy chủ");
    } finally {
      setIsValidating(false);
    }
  };
  const fetchDefaultCamera = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/default-camera');
      
      if (response.ok) {
        const data = await response.json();
        setDefaultCameraId(data[0].id);
      } else {
        setCameraStatus("Không thể tải danh sách camera");
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setCameraStatus("Lỗi kết nối khi lấy camera mặc định");
    }
  };

  const fetchAvailableCameras = async () => {
    setIsLoadingCameras(true);
    setCameraStatus("Đang tải danh sách camera...");
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/available-cameras');
      
      if (response.ok) {
        const data = await response.json();
        // Convert the data to the expected format
        const cameras = data.available_cameras.map((id: number) => ({ 
          id, 
          name: `Camera ${id}` 
        }));
        
        setAvailableCameras(cameras);
        
        // If cameras are available, set the first one as default
        if (cameras.length > 0) {
          setDefaultCameraId(cameras[0].id);
          setCameraStatus(`Đã tìm thấy ${cameras.length} camera`);
        } else {
          setCameraStatus("Không tìm thấy camera nào");
        }
      } else {
        setCameraStatus("Không thể tải danh sách camera");
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setCameraStatus("Lỗi kết nối khi tải danh sách camera");
    } finally {
      setIsLoadingCameras(false);
    }
  };

  const saveDefaultCamera = async () => {
    setCameraStatus("Đang lưu cài đặt camera mặc định...");
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/save-default-camera', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ camera_id: defaultCameraId })
      });

      if (response.ok) {
        setCameraStatus("Đã lưu camera mặc định thành công");
      } else {
        setCameraStatus("Không thể lưu cài đặt camera mặc định");
      }
    } catch (error) {
      console.error('Error saving default camera:', error);
      setCameraStatus("Lỗi kết nối khi lưu cài đặt camera");
    }
  };

  const saveBoundarySettings = async () => {
    setBoundaryStatus("Đang lưu cài đặt đường biên...");
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/save-boundary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: boundaryEnabled,
          color: boundaryColor,
          thickness: boundaryThickness
        })
      });

      if (response.ok) {
        setBoundaryStatus("Đã lưu cài đặt đường biên thành công");
      } else {
        setBoundaryStatus("Không thể lưu cài đặt đường biên");
      }
    } catch (error) {
      console.error('Error saving boundary settings:', error);
      setBoundaryStatus("Lỗi kết nối khi lưu cài đặt đường biên");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Cài đặt Hệ thống Camera</h1>
          
          {/* Section 1: Token Input */}
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <h2 className="text-lg font-semibold mb-3">1. Nhập Token</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                className="flex-1 min-w-64 p-2 border border-gray-300 rounded-md"
                placeholder="Nhập token xác thực"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isValidating}
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={validateToken}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <span className="inline-block animate-spin mr-2">↻</span>
                    Đang xác thực
                  </>
                ) : (
                  <>Xác thực</>
                )}
              </button>
            </div>
            {tokenStatus && (
              <div className={`mt-2 p-2 rounded-md text-sm ${
                tokenStatus.includes("hợp lệ") ? 'bg-green-100 text-green-800' : 
                tokenStatus.includes("không") ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {tokenStatus}
              </div>
            )}
          </div>
          
          {/* Section 2: Default Camera Selection */}
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <h2 className="text-lg font-semibold mb-3">2. Chọn Camera Mặc định</h2>
            <div className="mb-2">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={defaultCameraId}
                onChange={(e) => setDefaultCameraId(Number(e.target.value))}
                disabled={isLoadingCameras}
              >
                {isLoadingCameras ? (
                  <option value="">Đang tải danh sách camera...</option>
                ) : availableCameras.length === 0 ? (
                  <option value="">Không tìm thấy camera</option>
                ) : (
                  <>
                    <option value="">Chọn camera mặc định</option>
                    {availableCameras.map(camera => (
                      <option key={camera.id} value={camera.id}>
                        {camera.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-600">
                Camera mặc định sẽ được kích hoạt tự động khi hệ thống khởi động.
              </p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={saveDefaultCamera}
                disabled={isLoadingCameras || defaultCameraId === 0}
              >
                Lưu
              </button>
            </div>
            
            {cameraStatus && (
              <div className={`mt-2 p-2 rounded-md text-sm ${
                cameraStatus.includes("thành công") ? 'bg-green-100 text-green-800' : 
                cameraStatus.includes("Không") || cameraStatus.includes("Lỗi") ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {cameraStatus}
              </div>
            )}
          </div>
          
          {/* Section 3: Boundary Settings */}
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <h2 className="text-lg font-semibold mb-3">3. Thiết lập Đường Biên</h2>
            
            <div className="mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="boundaryEnabled"
                  className="mr-2 h-4 w-4"
                  checked={boundaryEnabled}
                  onChange={(e) => setBoundaryEnabled(e.target.checked)}
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
                    disabled={!boundaryEnabled}
                  />
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    value={boundaryColor}
                    onChange={(e) => setBoundaryColor(e.target.value)}
                    disabled={!boundaryEnabled}
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
                  disabled={!boundaryEnabled}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-600">
                Đường biên sẽ được hiển thị trên khung hình camera để đánh dấu vùng phát hiện chuyển động.
              </p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={saveBoundarySettings}
              >
                Lưu
              </button>
            </div>
            
            {boundaryStatus && (
              <div className={`mt-2 p-2 rounded-md text-sm ${
                boundaryStatus.includes("thành công") ? 'bg-green-100 text-green-800' : 
                boundaryStatus.includes("Không") || boundaryStatus.includes("Lỗi") ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {boundaryStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}