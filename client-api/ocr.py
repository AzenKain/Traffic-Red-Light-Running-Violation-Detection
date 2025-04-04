import cv2
from paddleocr import PaddleOCR
import logging
import numpy as np

ocr = PaddleOCR(use_angle_cls=True, lang='en') 
logging.getLogger("ppocr").setLevel(logging.ERROR)


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