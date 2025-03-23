import sqlite3
import json

def init_db():
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY, 
            default_camera INTEGER
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS camera_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            camera_id INTEGER,
            lines TEXT,
            UNIQUE(camera_id)
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

def save_camera_lines(camera_id: int, lines: list):
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("REPLACE INTO camera_lines (camera_id, lines) VALUES (?, ?)", (camera_id, json.dumps(lines)))
    conn.commit()
    conn.close()

def get_camera_lines(camera_id: int):
    conn = sqlite3.connect("cameras.db")
    cursor = conn.cursor()
    cursor.execute("SELECT lines FROM camera_lines WHERE camera_id = ?", (camera_id,))
    row = cursor.fetchone()
    conn.close()
    return json.loads(row[0]) if row else []
