import time
import cv2
import base64
import asyncio
import logging
import warnings
warnings.filterwarnings('ignore')
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from database import get_violations, init_db, get_default_camera, save_default_camera, save_camera_lines, get_camera_lines, save_camera_settings
from camera import get_available_cameras, get_camera, active_cameras
from detect_object import handle_traffic_violations
from detect_traffic import count_traffic_lights
from helper import decode_base64_to_dict
from yolo_setup import model

logging.getLogger("ultralytics").setLevel(logging.ERROR)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/available-cameras")
async def list_cameras():
    return {"available_cameras": get_available_cameras()}

@app.get("/default-camera")
async def get_saved_default_camera():
    return {"default_camera": get_default_camera()}

@app.get("/violations")
def read_violations():
    return get_violations()

@app.post("/save-settings")
async def save_settings(request: Request):
    req = await request.json()
    data = req.get("data")
    if data is None:
        return {"error": "data is required"}
    decoded_data = decode_base64_to_dict(data)
    camera_id = decoded_data.get("cameraId")
    server_url = decoded_data.get("server")
    key = decoded_data.get("key")
    if camera_id is None or server_url is None or key is None:
        return {"error": "cameraId, server, and key are required"}
    save_camera_settings(camera_id, server_url, key)
    return {"message": "Default camera saved successfully", "camera_id": camera_id}

@app.post("/save-default-camera")
async def save_camera(request: Request):
    data = await request.json()
    camera_id = data.get("camera_id")
    if camera_id is None:
        return {"error": "camera_id is required"}
    save_default_camera(camera_id)
    return {"message": "Default camera saved successfully", "camera_id": camera_id}

@app.post("/line/save")
async def save_lines(request: Request):
    data = await request.json()
    camera_id = data.get("camera_id")
    lines = data.get("lines")
    if camera_id is None or lines is None:
        return {"error": "camera_id and lines are required"}
    save_camera_lines(camera_id, lines)
    return {"message": "Camera lines saved successfully", "camera_id": camera_id}

@app.get("/line")
async def get_lines(camera_id: int):
    lines, ratio = get_camera_lines(camera_id)
    return {"camera_id": camera_id, "lines": lines, "ratio": ratio}

@app.post("/count_traffic_lights")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    count = count_traffic_lights(image)
    return {"count": count}

async def stream_video(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    try:
        cap = get_camera(camera_id)
        lines, ratio = get_camera_lines(camera_id)
        processed_vehicles = set()
        while True:
            success, frame = cap.read()
            if not success:
                cap.release()
                active_cameras.pop(camera_id, None)
                await asyncio.sleep(0.05)
                try:
                    cap = get_camera(camera_id)
                    continue
                except ValueError:
                    break

            width = 1280
            ratio = width / frame.shape[1]
            height = int(frame.shape[0] * ratio) 
            frame = cv2.resize(frame, (width, height))
            
            results = await asyncio.to_thread(model, frame)

            if results:
                frame, processed_vehicles = handle_traffic_violations(frame, results, lines, processed_vehicles)

            _, buffer = cv2.imencode(".jpg", frame)
            await websocket.send_bytes(buffer.tobytes())
            await asyncio.sleep(0.03)

    except WebSocketDisconnect:
        logging.info(f"Client ngắt kết nối từ camera {camera_id}")
    except Exception as e:
        logging.warning(f"WebSocket cho camera {camera_id} bị ngắt: {e}")
    finally:
        await websocket.close()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, camera_id: int = Query(None)):
    if camera_id is None:
        camera_id = get_default_camera()
    await stream_video(websocket, camera_id)

@app.on_event("shutdown")
async def shutdown_event():
    for cap in active_cameras.values():
        cap.release()
    active_cameras.clear()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
