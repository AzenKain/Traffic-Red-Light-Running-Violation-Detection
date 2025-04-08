
import cv2
import numpy as np
from yolo_setup import model


def count_traffic_lights(img):
    results = model(img)
    if not results:
        return 0

    result = results[0]
    traffic_light_class_id = 9

    if result.boxes is None or len(result.boxes) == 0:
        return 0

    count = (result.boxes.cls == traffic_light_class_id).sum().item()
    return count


def draw_colored_lines(frame, color_name, lines):
    result_frame = frame.copy()

    if color_name == "red":
        line_color = (0, 0, 255)  
        thickness = 3
    elif color_name == "yellow":
        line_color = (0, 255, 255)
        thickness = 3
    elif color_name == "green":
        line_color = (0, 255, 0)
        thickness = 3
    else:
        line_color = (255, 255, 255)  
        thickness = 1

    for line in lines:
        start_x = int(line["start"]["x"])
        start_y = int(line["start"]["y"])
        end_x = int(line["end"]["x"])
        end_y = int(line["end"]["y"])

        cv2.line(result_frame, (start_x, start_y), (end_x, end_y), line_color, thickness)

    return result_frame

def determine_color(img, box, conf):
    x1, y1, x2, y2 = int(box[0]), int(box[1]), int(box[2]), int(box[3])
    frame = img.copy()  

    traffic_light = img[y1:y2, x1:x2]

    if traffic_light.size == 0:
        color_name = "unknown"
    else:
        traffic_light = cv2.GaussianBlur(traffic_light, (5, 5), 0)
        hsv = cv2.cvtColor(traffic_light, cv2.COLOR_BGR2HSV)

        lower_red1 = np.array([0, 100, 100])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([160, 100, 100])
        upper_red2 = np.array([180, 255, 255])

        lower_yellow = np.array([15, 50, 50])  
        upper_yellow = np.array([40, 255, 255])

        lower_green = np.array([40, 50, 50])
        upper_green = np.array([90, 255, 255])

        mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask_red = cv2.bitwise_or(mask_red1, mask_red2)
        mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
        mask_green = cv2.inRange(hsv, lower_green, upper_green)

        red_pixels = cv2.countNonZero(mask_red)
        yellow_pixels = cv2.countNonZero(mask_yellow)
        green_pixels = cv2.countNonZero(mask_green)

        total_area = traffic_light.shape[0] * traffic_light.shape[1]
        min_pixel_threshold = max(30, total_area * 0.03)

        max_pixels = max(red_pixels, yellow_pixels, green_pixels)

        if max_pixels == red_pixels and red_pixels > min_pixel_threshold:
            color_name = "red"
        elif max_pixels == yellow_pixels and yellow_pixels > min_pixel_threshold:
            color_name = "yellow"
        elif max_pixels == green_pixels and green_pixels > min_pixel_threshold:
            color_name = "green"
        else:
            color_name = "unknown"

    if color_name == "red":
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
    elif color_name == "yellow":
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
    elif color_name == "green":
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
    else:
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)

    label = f"light: {color_name} ({conf:.2f})"

    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

    return frame, color_name