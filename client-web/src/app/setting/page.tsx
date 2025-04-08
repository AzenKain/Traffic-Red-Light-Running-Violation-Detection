"use client";
import AnnotateImage from "@/components/draw";
import { se } from "date-fns/locale";
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
    const [defaultCameraId, setDefaultCameraId] = useState<number>(-1);
    const [isLoadingCameras, setIsLoadingCameras] = useState<boolean>(false);
    const [cameraStatus, setCameraStatus] = useState<string>("");

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [websocket, setWebsocket] = useState<WebSocket | null>(null);
    const [annotateImageSrc, setAnnotateImageSrc] = useState<string | null>(null);

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
            const response = await fetch('http://localhost:8000/save-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: token })
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

    const fetchAvailableCameras = async () => {
        setIsLoadingCameras(true);
        setCameraStatus("Đang tải danh sách camera...");

        let selected = -1
        try {
            // Replace with your actual API endpoint
            const response = await fetch('http://localhost:8000/default-camera');

            if (response.ok) {
                const data = await response.json();
                selected = Number(data.default_camera)
                setDefaultCameraId(selected);
            }
        } catch (error) {
            console.error('Error fetching cameras:', error);
            setCameraStatus("Lỗi kết nối khi lấy camera mặc định");
        }
        try {
            // Replace with your actual API endpoint
            const response = await fetch('http://localhost:8000/available-cameras');

            if (response.ok) {
                const data = await response.json();
                // Convert the data to the expected format
                const cameras = data.available_cameras.map((id: number) => ({
                    id: id + 1,
                    name: `Camera ${id}`
                }));

                setAvailableCameras(cameras);

                // If cameras are available, set the first one as default
                if (cameras.length > 0 && selected === -1) {
                    setDefaultCameraId(cameras[0].id);
                    setCameraStatus(`Đã tìm thấy ${cameras.length} camera`);
                } else if (cameras.length === 0) {
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
                body: JSON.stringify({ camera_id: defaultCameraId - 1 })
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


    useEffect(() => {
        if (websocket) {
            websocket.close();
            setWebsocket(null);
            setImageSrc(null);
        }
        if (defaultCameraId === -1) return
        let selectCamera = defaultCameraId - 1
        if (selectCamera < 0) selectCamera = 0


        const ws = new WebSocket(`ws://localhost:8000/ws?camera_id=${selectCamera}`);
        setWebsocket(ws);

        ws.onopen = () => {
            console.log(`WebSocket connected to camera ${selectCamera}`);
        };

        ws.onmessage = (event) => {
            const arrayBuffer = event.data;
        
            const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
        
            const imageUrl = URL.createObjectURL(blob);
    
            setImageSrc(imageUrl);
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
    }, [defaultCameraId]);

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <div className="bg-base-200 shadow-md rounded-lg overflow-hidden">
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
                            <div className={`mt-2 p-2 rounded-md text-sm ${tokenStatus.includes("hợp lệ") ? 'bg-green-100 text-green-800' :
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
                            <p className="text-sm text-base-content">
                                Camera mặc định sẽ được kích hoạt tự động khi hệ thống khởi động.
                            </p>
                            <button
                                className="btn px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={saveDefaultCamera}
                                disabled={isLoadingCameras || defaultCameraId === 0}
                            >
                                Lưu
                            </button>
                        </div>

                        {cameraStatus && (
                            <div className={`mt-2 p-2 rounded-md text-sm ${cameraStatus.includes("thành công") ? 'bg-green-100 text-green-800' :
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

                        <div className="flex justify-between items-center mt-3">
                            <p className="text-sm text-base-content">
                                Đường biên sẽ được hiển thị trên khung hình camera để đánh dấu vùng phát hiện chuyển động.
                            </p>
                            <button
                                className="btn px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={() => {
                                    if (imageSrc) {
                                        setAnnotateImageSrc(imageSrc);
                                        (document.getElementById("my_modal_4") as HTMLDialogElement)?.showModal();
                                    }
                                }}
                            >
                                Mở thiết lập
                            </button>
                        </div>

                        <div className="relative w-full mt-6 px-4">
                            {imageSrc ? (
                                <div className="space-y-4">
                                    <div className="w-full h-[300px] flex items-center justify-center overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-xl">
                                        <img
                                            src={imageSrc}
                                            alt="Live Stream"
                                            className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                                        />
                                    </div>

                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-72 bg-base-200 rounded-xl shadow-inner">
                                    <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                                    <p className="text-lg font-medium text-base-content/70">
                                        {availableCameras.length === 0 ? "Không tìm thấy camera" : "Đang tải luồng dữ liệu..."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal sửa lại để full-screen */}
                        <dialog id="my_modal_4" className="modal">
                            <div className="modal-box h-[95%] max-h-[110rem] w-11/12 max-w-[100rem]">
                                <form method="dialog" className="sticky top-0 z-[20]">
                                    <button className="btn btn-circle btn-error btn-md absolute right-2 top-2 rounded-full border border-stroke text-xl">
                                        ✕
                                    </button>
                                </form>
                                {annotateImageSrc && <AnnotateImage imageSrc={annotateImageSrc} cameraId={defaultCameraId} />}

                            </div>
                        </dialog>
                    </div>

                </div>

            </div>
        </div>
    );
}