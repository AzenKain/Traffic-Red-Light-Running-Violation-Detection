import asyncio
import sqlite3
import json
import time
import cv2
import numpy as np
import base64
import requests
from helper import AESCrypt
import aiohttp

def init_db():
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY, 
            default_camera INTEGER,
            camera_id TEXT,
            server_url TEXT,
            key TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS camera_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            camera_id INTEGER,
            lines TEXT,
            ratio REAL,
            UNIQUE(camera_id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time INTEGER,
            plate_text TEXT,
            vehicle_type TEXT,
            vehicle_image BLOB,
            plate_image BLOB
        )
    """)
    conn.commit()
    conn.close()


def get_default_camera():
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("SELECT default_camera FROM settings WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def save_default_camera(camera_id: int):
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("REPLACE INTO settings (id, default_camera) VALUES (1, ?)", (camera_id,))
    conn.commit()
    conn.close()

def save_camera_settings(camera_id: str, server_url: str, key: str):
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("REPLACE INTO settings (id, camera_id, server_url, key) VALUES (2, ?, ?, ?)", (camera_id, server_url, key))
    conn.commit()
    conn.close()   

def get_camera_settings():
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("SELECT camera_id, server_url, key FROM settings WHERE id = 2")
    row = cursor.fetchone()
    conn.close()
    return {
        "camera_id": row[0],
        "server_url": row[1],
        "key": row[2]
    } if row else None

def save_camera_lines(camera_id: int, lines: list, ratio: float = 1):
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("REPLACE INTO camera_lines (camera_id, lines, ratio) VALUES (?, ?, ?)", (camera_id, json.dumps(lines), ratio))
    conn.commit()
    conn.close()

def get_camera_lines(camera_id: int):
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("SELECT lines, ratio FROM camera_lines WHERE camera_id = ?", (camera_id,))
    row = cursor.fetchone()
    conn.close()
    return (json.loads(row[0]), row[1]) if row else ([], 1)

def image_to_base64(image):
    _, buffer = cv2.imencode(".jpg", image)
    return base64.b64encode(buffer).decode("utf-8")

def save_violation(plate_text, vehicle_type, vehicle_img, plate_img):
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    current_time = int(time.time())
    
    cursor.execute("SELECT time FROM violations WHERE plate_text = ? ORDER BY time DESC LIMIT 1", (plate_text,))
    last_record = cursor.fetchone()

    if last_record and current_time - last_record[0] <= 10:
        conn.close()
        return
    
    vehicle_img_b64 = image_to_base64(vehicle_img)
    plate_img_b64 = image_to_base64(plate_img)
    
    cursor.execute("INSERT INTO violations (time, plate_text, vehicle_type, vehicle_image, plate_image) VALUES (?, ?, ?, ?, ?)", 
                (current_time, plate_text, vehicle_type, vehicle_img_b64, plate_img_b64))

    conn.commit()
    conn.close()

    cam = get_camera_settings()
    if not cam:
        return
    
    payload = {
        "plate_text": plate_text,
        "vehicle_type": vehicle_type,
        "time": current_time,
        "vehicle_image": f"data:image/jpeg;base64,{vehicle_img_b64}",
        "plate_image": f"data:image/jpeg;base64,{plate_img_b64}"
    }
    try:
        asyncio.create_task(send_encrypted_request(payload, cam))  
    except Exception as e:
        print(f"Error scheduling send task: {e}")

def get_violations():
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, time, plate_text, vehicle_type, vehicle_image, plate_image FROM violations ORDER BY time DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{
        "id": row[0],
        "time": row[1],
        "plate_text": row[2],
        "vehicle_type" : row[3],
        "vehicle_image": f"data:image/jpeg;base64,{row[4]}",
        "plate_image": f"data:image/jpeg;base64,{row[5]}"
    } for row in rows]

async def send_encrypted_request(payload: dict, cam: dict):
    url = f"{cam['server_url']}/violation/create/{cam['camera_id']}"
    aes = AESCrypt(cam['key'])
    encrypted_b64 = aes.encrypt(json.dumps(payload))
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json={"data": encrypted_b64}) as res:
            text = await res.text()
            if res.status != 201:
                print(f"Failed to send violation data: {text}")