import cv2
from detect_plate import extract_license_plate
import logging
from database import save_violation
from paddleocr import PaddleOCR

# Khởi tạo PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en') 
logging.getLogger("ppocr").setLevel(logging.ERROR)
violation_history = []

def detect_vehicles_crossing_line(frame, results, lines, threshold=0.33):
    violating_vehicles = []
    vehicle_classes = ["car", "motorcycle", "truck", "bus", "bicycle"]

    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls = int(box.cls.item())
            cls_name = result.names[cls]
            
            if cls_name in vehicle_classes:
                try:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                except (IndexError, ValueError) as e:
                    logging.error(f"Error unpacking box coordinates: {e}")
                    continue

                conf = box.conf.item()
                if conf > 0.4:
                    if check_vehicle_crossed_line(frame, (x1, y1, x2, y2), lines):
                        violating_vehicles.append(((x1, y1, x2, y2), cls_name))

    return violating_vehicles

def check_intersection(A, B, C, D):
    """
    Kiểm tra xem đoạn thẳng AB có cắt đoạn thẳng CD không.
    """
    def ccw(P, Q, R):
        return (R[1] - P[1]) * (Q[0] - P[0]) > (Q[1] - P[1]) * (R[0] - P[0])

    return ccw(A, C, D) != ccw(B, C, D) and ccw(A, B, C) != ccw(A, B, D)


def check_vehicle_crossed_line(frame, bbox, lines):
    if not lines or not isinstance(lines, list) or not isinstance(lines[0], dict) or \
       "start" not in lines[0] or "end" not in lines[0]:
        logging.warning("Invalid lines format or empty lines")
        return False

    x1, y1, x2, y2 = bbox  
    vehicle_bottom = (x1 + (x2 - x1) // 2, y2)  

    for line in lines:
        try:
            x_start, y_start = line["start"]["x"], line["start"]["y"]
            x_end, y_end = line["end"]["x"], line["end"]["y"]
        except KeyError as e:
            logging.error(f"Missing key in line dictionary: {e}")
            continue

        
        y_line_at_x = y_start + (y_end - y_start) * (vehicle_bottom[0] - x_start) // (x_end - x_start)

        if y1 <= y_line_at_x <= y2:
            return True  

    return False

def process_license_plate(frame, bbox):
    try:
        x1, y1, x2, y2 = bbox
    except ValueError as e:
        logging.error(f"Invalid bbox format: {e}")
        return None

    vehicle_img = frame[int(y1):int(y2), int(x1):int(x2)]
    if vehicle_img.size == 0:
        return None

    frame, plate_img = extract_license_plate(frame, vehicle_img)
    if len(plate_img) == 0:
        return None
    plate_text = apply_ocr_to_image(plate_img[0])
    if plate_text != "":
        plate_text = ''.join(c for c in plate_text if c.isalnum())
        save_violation(plate_text, vehicle_img, plate_img[0])
        return plate_text
    return None

def draw_violation_info(frame, bbox, vehicle_type, plate_text=None):
    try:
        x1, y1, x2, y2 = bbox
    except ValueError as e:
        logging.error(f"Invalid bbox for drawing: {e}")
        return frame

    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
    cv2.putText(frame, f"VIOLATION: {vehicle_type}", (int(x1), int(y1) - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    if plate_text:
        cv2.putText(frame, f"Plate: {plate_text}", (int(x1), int(y1) - 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
    return frame

def handle_traffic_violations(frame, results, lines, processed_vehicles, red_light_active):
    if red_light_active:
        violations = detect_vehicles_crossing_line(frame, results, lines)
        for bbox, vehicle_type in violations:
            try:
                x1, y1, x2, y2 = bbox
            except ValueError as e:
                logging.error(f"Invalid bbox in violations: {e}")
                continue

            vehicle_id = f"{int(x1)}_{int(y1)}_{int(x2)}_{int(y2)}"
            if vehicle_id not in processed_vehicles:
                processed_vehicles.add(vehicle_id)
                plate_text = process_license_plate(frame, bbox)
                
                if plate_text != None:
                    frame = draw_violation_info(frame, bbox, vehicle_type, plate_text)
                    violation_history.append(plate_text)
                    logging.info(f"Vi phạm đèn đỏ: {plate_text} ({vehicle_type})")

    if len(processed_vehicles) > 100:
        processed_vehicles.clear()

    return frame, processed_vehicles

def apply_ocr_to_image(image_array):
    if image_array is None or image_array.size == 0:
        return None
    
    try:
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            image = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        else:
            image = image_array.copy() 

        image = cv2.resize(image, (image.shape[1] * 2, image.shape[0] * 2))

        result = ocr.ocr(image)
        if result[0] is None:
            return ""
        recognized_text = []

        for line in result:
            for detection in line:
                text = detection[1][0]
                recognized_text.append(text)

        res = ' '.join(recognized_text).strip()
        res = ' '.join(res.split())
        print(res)
        return res
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""