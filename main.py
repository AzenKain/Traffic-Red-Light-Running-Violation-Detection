import cv2
import base64
import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_default_camera, save_default_camera, save_camera_lines, get_camera_lines
from camera import get_available_cameras, get_camera, active_cameras
from typing import Dict, List

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

@app.post("/save-default-camera")
async def save_camera(request: Request):
    data = await request.json()
    camera_id = data.get("camera_id")
    if camera_id is None:
        return {"error": "camera_id is required"}
    save_default_camera(camera_id)
    return {"message": "Default camera saved successfully", "camera_id": camera_id}

@app.post("/save-camera-lines")
async def save_lines(request: Request):
    data = await request.json()
    camera_id = data.get("camera_id")
    lines = data.get("lines")
    if camera_id is None or lines is None:
        return {"error": "camera_id and lines are required"}
    save_camera_lines(camera_id, lines)
    return {"message": "Camera lines saved successfully", "camera_id": camera_id}

@app.get("/camera-lines")
async def get_lines(camera_id: int):
    return {"camera_id": camera_id, "lines": get_camera_lines(camera_id)}

async def stream_video(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    try:
        cap = get_camera(camera_id)
        while True:
            success, frame = cap.read()
            if not success:
                cap.release()
                active_cameras.pop(camera_id, None)
                await asyncio.sleep(1)
                try:
                    cap = get_camera(camera_id)
                    continue
                except ValueError:
                    break
            _, buffer = cv2.imencode(".jpg", frame)
            img_str = base64.b64encode(buffer).decode("utf-8")
            await websocket.send_text(img_str)
            await asyncio.sleep(0.02)
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
