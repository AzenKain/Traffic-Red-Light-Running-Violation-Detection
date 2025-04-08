import cv2
import numpy as np

penalized_texts = []
license_plate_cascade = cv2.CascadeClassifier('haarcascade_plate_number.xml')

def extract_license_plate(frame, mask_line):
    result_frame = frame.copy()    
    gray = cv2.cvtColor(mask_line, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    
    kernel = np.ones((2, 2), np.uint8)
    gray = cv2.erode(gray, kernel, iterations=1)

    non_black_points = cv2.findNonZero(gray)
    x, y, w, h = cv2.boundingRect(non_black_points)
    w = int(w * 0.7)

    cropped_gray = gray[y:y+h, x:x+w]

    license_plates = license_plate_cascade.detectMultiScale(cropped_gray, scaleFactor=1.07, minNeighbors=15, minSize=(20, 20))
    license_plate_images = []

    if len(license_plates) == 0:
        return result_frame, license_plate_images  # Trả về frame gốc nếu không có biển số

    for (x_plate, y_plate, w_plate, h_plate) in license_plates:
        cv2.rectangle(result_frame, (x_plate + x, y_plate + y), (x_plate + x + w_plate, y_plate + y + h_plate), (0, 255, 0), 3)
        license_plate_image = cropped_gray[y_plate:y_plate+h_plate, x_plate:x_plate+w_plate]
        license_plate_images.append(license_plate_image)

    return result_frame, license_plate_images
