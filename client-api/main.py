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
from database import get_violations, init_db, get_default_camera, save_default_camera, save_camera_lines, get_camera_lines
from camera import get_available_cameras, get_camera, active_cameras
from detect_object import handle_traffic_violations
from detect_traffic import count_traffic_lights, determine_color, draw_colored_lines
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
                await asyncio.sleep(1)
                try:
                    cap = get_camera(camera_id)
                    continue
                except ValueError:
                    break

            results = model(frame)
            red_light = False
            class_name = "traffic light"
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls = int(box.cls.item())
                    cls_name = result.names[cls]

                    if cls_name == class_name:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        conf = box.conf.item()

                        if conf > 0.5:
                            frame, color_name = determine_color(frame, (x1, y1, x2, y2), conf)
                            frame = draw_colored_lines(frame, color_name, lines)
                            if color_name == "red":
                                red_light = True

            frame, processed_vehicles = handle_traffic_violations(frame, results, lines, processed_vehicles, red_light)

            _, buffer = cv2.imencode(".jpg", frame)
            img_str = base64.b64encode(buffer).decode("utf-8")
            await websocket.send_text(img_str)
            await asyncio.sleep(0.01)

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
