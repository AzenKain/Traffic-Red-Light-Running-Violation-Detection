# Red Light Violation Detection

## Technologies Used

- **YOLO v12** for object detection
- **Haar Cascade** for license plate detection
- **PaddleOCR** for optical character recognition
- **FastAPI** as the backend framework
- **SQLite** for data storage
- **Next.js** for the frontend

## Overview

This project detects vehicles running red lights using YOLO v12, Haar Cascade, and PaddleOCR. The backend is built with FastAPI and SQLite, while the frontend is developed with Next.js.

## Project Logic

1. **Camera Streaming:** The system captures live video feeds from connected cameras.
2. **Traffic Light Detection:** YOLO v12 detects traffic lights, and PaddleOCR verifies the light color.
3. **Vehicle Tracking:** Vehicles are detected in real-time using YOLO v12.
4. **Violation Detection:** If a vehicle crosses the detection line while the light is red, it is marked as a violator.
5. **License Plate Recognition:** Haar Cascade and PaddleOCR extract the vehicle's license plate number.
6. **Data Storage:** Violations, including vehicle images and details, are stored in an SQLite database.
7. **WebSocket Streaming:** Processed video frames with detected violations are streamed to the frontend.
8. **User Interface:** The Next.js frontend displays real-time video, violation reports, and analytics.

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```sh
   cd client-api
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```sh
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd client-web
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the Next.js development server:
   ```sh
   npm run dev
   ```

## DockerCompose only use when you know how to pass thought camera device to docker container.

```sh
networks:
app_cv:
 driver: bridge

services:
backend:
 image: azenkain/apicv:latest
 container_name: apicv_app
 ports:
   - "8000:8000"
 volumes:
   - ./data:/app/data
 environment:
   - PYTHONUNBUFFERED=1
 networks:
   - app_cv
 # devices:
 #   # - "/dev/video0:/dev/video0" EX: for linux pass thought camera
 #   # - "/dev/video1:/dev/video1"
 #   # - "/dev/video2:/dev/video2"
 # privileged: true
 restart: unless-stopped

frontend:
 image: azenkain/fecv:latest
 container_name: fecv_app
 ports:
   - "3000:3000"
 depends_on:
   - backend
 networks:
   - app_cv
 restart: unless-stopped
```

## API Endpoints

### Camera and Settings

- `GET /available-cameras` - List available cameras.
- `GET /default-camera` - Get the saved default camera.
- `POST /save-default-camera` - Save a camera as the default.
- `POST /line/save` - Save camera detection lines.
- `GET /line?camera_id={id}` - Retrieve saved camera lines.

### Red-Light Violations

- `GET /violations` - Retrieve recorded red-light violations.

### Traffic Light Detection

- `POST /count_traffic_lights` - Upload an image and count the traffic lights.

### WebSocket Streaming

- `WS /ws?camera_id={id}` - Stream live video with red-light violation detection.

