# python_server.py - Our Python AI Backend

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import time
import os

# --- NEW: Import dotenv to load environment variables from .env file ---
from dotenv import load_dotenv
load_dotenv() # Load environment variables from .env file

# --- IMPORTANT: REAL YOLOv8 MODEL INTEGRATION ---
# UNCOMMENT the following lines to enable actual YOLOv8 detection.
# Ensure 'ultralytics' and 'opencv-python' are installed in your virtual environment.
from ultralytics import YOLO
model = YOLO('yolov8n.pt') # Load a pre-trained YOLOv8n model (downloads automatically if not found)
print("YOLOv8 model loaded successfully.")


app = Flask(__name__)
CORS(app)

# This variable will store the currently selected detection mode from the frontend
current_detection_mode = "general_simulation" # Default mode for general demo

@app.route('/set_detection_mode', methods=['POST'])
def set_detection_mode():
    """
    Endpoint to set the active detection mode for simulation or actual processing.
    Frontend will send a JSON with 'mode' (e.g., 'weapon', 'fire_smoke', 'crowd').
    """
    global current_detection_mode
    data = request.json
    mode = data.get('mode')
    if mode in ['weapon', 'fire_smoke', 'license_plate', 'theft', 'crowd', 'general_simulation']:
        current_detection_mode = mode
        print(f"Python Backend: Detection mode set to '{current_detection_mode}'")
        return jsonify({"status": "success", "message": f"Mode set to {mode}"})
    else:
        return jsonify({"status": "error", "message": "Invalid detection mode"}), 400

@app.route('/detect_frame', methods=['POST'])
def detect_frame():
    """
    Endpoint to receive a video frame (base64 encoded) and return a detection result
    based on the current_detection_mode.
    """
    data = request.json
    if 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400

    image_b64 = data['image']
    try:
        # Remove the "data:image/jpeg;base64," or "data:image/png;base64," prefix
        header, encoded = image_b64.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        # Convert bytes to numpy array, then to OpenCV image
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            raise ValueError("Could not decode image from base64 data.")

    except Exception as e:
        print(f"Error decoding image: {e}")
        return jsonify({"error": "Invalid image data or failed to decode"}), 400

    # Initialize default results
    detection_result = "Processing..."
    overlay_color = "#FFFFFF" # Default white

    # --- ACTUAL YOLOv8 DETECTION LOGIC BASED ON current_detection_mode ---
    # The 'model' variable is now globally available if uncommented above.

    try:
        if current_detection_mode == "weapon":
            # YOLOv8 for weapon detection (assuming 'weapon' class is trained or mapped)
            # COCO dataset (yolov8n.pt) does NOT have a 'weapon' class by default.
            # This will detect objects that *might* be weapons (e.g., 'knife', 'handgun' if custom trained).
            # For demonstration, we will simulate if no specific weapon class is found.
            results = model.predict(source=frame, conf=0.4, save=False)
            weapon_detected = False
            # Common COCO classes that might be relevant for 'weapon' simulation:
            # 0: person, 1: bicycle, 2: car, 3: motorcycle, 4: airplane, 5: bus, 6: train, 7: truck, 8: boat,
            # 9: traffic light, 10: fire hydrant, 11: stop sign, 12: parking meter, 13: bench, 14: bird,
            # 15: cat, 16: dog, 17: horse, 18: sheep, 19: cow, 20: elephant, 21: bear, 22: zebra, 23: giraffe,
            # 24: backpack, 25: umbrella, 26: handbag, 27: tie, 28: suitcase, 29: frisbee, 30: skis,
            # 31: snowboard, 32: sports ball, 33: kite, 34: baseball bat, 35: baseball glove, 36: skateboard,
            # 37: surfboard, 38: tennis racket, 39: bottle, 40: wine glass, 41: cup, 42: fork, 43: knife,
            # 44: spoon, 45: bowl, 46: banana, 47: apple, 48: sandwich, 49: orange, 50: broccoli, 51: carrot,
            # 52: hot dog, 53: pizza, 54: donut, 55: cake, 56: chair, 57: couch, 58: potted plant, 59: bed,
            # 60: dining table, 61: toilet, 62: tv, 63: laptop, 64: mouse, 65: remote, 66: keyboard,
            # 67: cell phone, 68: microwave, 69: oven, 70: toaster, 71: sink, 72: refrigerator, 73: book,
            # 74: clock, 75: vase, 76: scissors, 77: teddy bear, 78: hair drier, 79: toothbrush

            # We'll simulate weapon detection for now, as yolov8n.pt doesn't have explicit 'weapon' classes.
            # To make this real, you'd need a custom-trained YOLO model with 'weapon' classes.
            if time.time() % 10 < 3: # Simulate detection for 3 seconds every 10 seconds
                detection_result = "WEAPON DETECTED! (Simulated)"
                overlay_color = "#FF0000" # Red for alert
            else:
                detection_result = "No weapon detected."
                overlay_color = "#00FF00" # Green for clear

        elif current_detection_mode == "fire_smoke":
            # YOLOv8 for fire/smoke detection.
            # COCO dataset (yolov8n.pt) does NOT have 'fire' or 'smoke' classes.
            # This requires a custom-trained YOLO model for accurate detection.
            # For demonstration, we will simulate.
            if time.time() % 15 < 4:
                detection_result = "FIRE/SMOKE DETECTED! (Simulated)"
                overlay_color = "#FFA500" # Orange
            else:
                detection_result = "Clear."
                overlay_color = "#00FF00"

        elif current_detection_mode == "license_plate":
            # License Plate Recognition (LPR) with EasyOCR.
            # This requires a more complex setup (initializing EasyOCR reader, then detecting plates).
            # For simplicity and to avoid large downloads/slow startup, we'll keep it simulated.
            # To make this real:
            # 1. pip install easyocr
            # 2. reader = easyocr.Reader(['en']) # Initialize once globally if possible
            # 3. Detect vehicles, then crop license plate region, then reader.readtext(cropped_image)
            if time.time() % 12 < 5:
                detection_result = "PLATE: ABC 1234 (Simulated)"
                overlay_color = "#00FFFF" # Cyan
            else:
                detection_result = "No plate detected."
                overlay_color = "#FFFFFF"

        elif current_detection_mode == "theft":
            # Theft Detection (Object Disappearance) with YOLOv8.
            # This requires tracking objects over time. YOLOv8 can detect objects.
            # The 'disappearance' logic needs to be built on top of YOLO detections.
            # For demonstration, we will simulate.
            if time.time() % 20 < 6:
                detection_result = "ALERT: OBJECT MISSING! (Simulated)"
                overlay_color = "#FFFF00" # Yellow
            else:
                detection_result = "All objects present."
                overlay_color = "#00FF00"

        elif current_detection_mode == "crowd":
            # --- ACTUAL CROWD DETECTION LOGIC with YOLOv8 ---
            # This uses the 'person' class (class 0) from the COCO dataset.
            results = model.predict(source=frame, conf=0.4, save=False)
            detections = results[0]

            person_count = 0
            for cls_id in detections.boxes.cls:
                if int(cls_id) == 0:  # Class 0 is 'person' in YOLOv8's default COCO model
                    person_count += 1

            # Determine crowd density level based on person_count
            if person_count == 0:
                density = "Empty"
                color_hex = "#FFFFFF" # White
            elif person_count < 2:
                density = "Low Crowd"
                color_hex = "#00FF00" # Green
            elif person_count < 4:
                density = "Medium Crowd"
                color_hex = "#00FFFF" # Cyan
            else:
                density = "HIGH CROWD - ALERT!"
                color_hex = "#FF0000" # Red for alert

            detection_result = f"People: {person_count} | Density: {density}"
            overlay_color = color_hex

        else: # General simulation mode for main page demo
            # This is the default for the main page's "Connect Webcam" button
            # We'll make it simulate weapon detection by default here
            if time.time() % 10 < 3:
                detection_result = "GENERAL DEMO: WEAPON DETECTED! (Simulated)"
                overlay_color = "#FF0000"
            else:
                detection_result = "GENERAL DEMO: No threat detected."
                overlay_color = "#00FF00"

    except Exception as e:
        print(f"Error during YOLOv8 detection: {e}")
        detection_result = "AI Processing Error! (See Python Console)"
        overlay_color = "#800000" # Dark red for critical error


    print(f"Python Backend: Processed frame for '{current_detection_mode}'. Result: {detection_result}")
    return jsonify({"detection": detection_result, "color": overlay_color})


# --- ACTUAL GEMINI API INTEGRATION ---
# UNCOMMENT the following lines to enable actual Gemini API calls.
# Ensure 'google-generativeai' is installed in your virtual environment.

import google.generativeai as genai

# Get API key from environment variable (loaded from .env file)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel(model_name="gemini-pro")
    print("Gemini model configured for text generation.")
else:
    gemini_model = None
    print("GEMINI_API_KEY not found. Gemini API features will run in simulation mode.")


@app.route('/generate_object_description', methods=['POST'])
def generate_object_description():
    data = request.json
    object_name = data.get('objectName')

    if not object_name:
        return jsonify({"error": "Object name is required."}), 400

    if gemini_model: # Use actual Gemini API if configured
        try:
            prompt = f"Generate a detailed description of '{object_name}' focusing on its common characteristics and potential relevance or appearance in a security or criminal activity context. Keep the response concise and informative."
            response = gemini_model.generate_content(prompt)
            generated_text = response.text
        except Exception as e:
            print(f"Gemini API Error for object description: {e}")
            generated_text = f"Failed to generate description due to API error: {str(e)}. Please check your API key and internet connection."
    else: # Simulation fallback if Gemini model is not configured
        print(f"Simulating object description for: {object_name}")
        time.sleep(1) # Simulate AI thinking time
        if object_name.lower() == "knife":
            generated_text = "A sharp-edged tool, typically with a blade and a handle. In a security context, a knife can be considered a concealed weapon. Detection focuses on its shape, glint, and how it's carried or brandished, indicating potential threat or prohibited item. Can be used for assault or threatening purposes. (Simulated)"
        elif object_name.lower() == "backpack":
            generated_text = "A bag worn on the back, commonly used for carrying personal items, books, or luggage. In security, backpacks are often checked for suspicious contents as they can conceal various objects, including illicit items or explosives. Unusual weight distribution or placement might be a concern. (Simulated)"
        elif object_name.lower() == "vehicle":
            generated_text = "Any machine used to transport people or cargo. In security, vehicles are monitored for unauthorized access, suspicious parking, or use in criminal activities like ramming or transportation of illegal goods. License plate recognition and behavioral analysis are key detection methods. (Simulated)"
        else:
            generated_text = f"The {object_name} is a common item. In a security context, its relevance would depend on its size, location, and how it is being used or carried. Anomalous behavior associated with it would be a primary concern. (Simulated)"

    return jsonify({"description": generated_text})


@app.route('/generate_security_advice', methods=['POST'])
def generate_security_advice():
    data = request.json
    scenario = data.get('scenario')

    if not scenario:
        return jsonify({"error": "Security scenario is required."}), 400

    if gemini_model: # Use actual Gemini API if configured
        try:
            prompt = f"Given the security scenario: '{scenario}', provide general advice on relevant security protocols and considerations. Focus on practical steps and common best practices."
            response = gemini_model.generate_content(prompt)
            generated_text = response.text
        except Exception as e:
            print(f"Gemini API Error for security advice: {e}")
            generated_text = f"Failed to generate advice due to API error: {str(e)}. Please check your API key and internet connection."
    else: # Simulation fallback if Gemini model is not configured
        print(f"Simulating security advice for: {scenario}")
        time.sleep(1.5) # Simulate AI thinking time
        if "retail store at night" in scenario.lower():
            generated_text = "For a retail store at night, key protocols include: ensuring all entry points are securely locked (doors, windows, back exits), activating a comprehensive alarm system with motion sensors, engaging external security patrols, clearing cash registers, storing valuables in a secure safe, and checking CCTV systems for proper coverage and recording before closing. Consider remote monitoring and rapid response services. (Simulated)"
        elif "large public event" in scenario.lower():
            generated_text = "Securing a large public event requires a multi-layered approach: conduct thorough pre-event risk assessments, implement access control points with bag checks and metal detectors, deploy visible and plainclothes security personnel, establish clear emergency exits and evacuation plans, utilize extensive CCTV surveillance with crowd density monitoring, and maintain clear communication channels with local law enforcement and emergency services. Consider drone surveillance for perimeter monitoring. (Simulated)"
        else:
            generated_text = f"For the scenario '{scenario}', general security advice includes: conducting a thorough risk assessment, implementing access controls, deploying surveillance systems (CCTV), ensuring adequate lighting, establishing clear emergency procedures, training staff on security protocols, and maintaining communication with local authorities. Regular drills and system maintenance are also crucial. (Simulated)"

    return jsonify({"advice": generated_text})


if __name__ == '__main__':
    # Run the Flask app on a different port than Node.js
    app.run(host='127.0.0.1', port=5000, debug=True)
