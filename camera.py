import cv2
from typing import Dict, List

active_cameras: Dict[int, cv2.VideoCapture] = {}

def get_available_cameras() -> List[int]:
    available_cameras = []
    index = 0
    while True:
        cap = cv2.VideoCapture(index)
        if not cap.isOpened():
            break
        else:
            available_cameras.append(index)
        cap.release()
        index += 1
    return available_cameras

def get_camera(camera_id: int) -> cv2.VideoCapture:
    if camera_id not in active_cameras:
        cap = cv2.VideoCapture(camera_id)
        if not cap.isOpened():
            raise ValueError(f"Không thể mở camera {camera_id}")
        active_cameras[camera_id] = cap
    return active_cameras[camera_id]
