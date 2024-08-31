import logging
import cv2
from fastapi import FastAPI, WebSocket
from camera_control import BaslerCamera
import uvicorn
from dotenv import load_dotenv
import os
import asyncio
import base64
import httpx
from collections import defaultdict
from fastapi.middleware.cors import CORSMiddleware

env_path = '/home/qi02/Quality_project/CORNINSPEC-INLINE/CORNINSPEC-INLINE-BE/.env'

# Load environment variables from .env file
load_dotenv(dotenv_path=env_path)
print(os.getenv("PREDICT_RESULT_SERVICE_ENDPOINT"))

# Initialize logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# เพิ่ม CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize camera
model_path = ('./best_model/best_corn_yolov8x_seg.pt')
camera = BaslerCamera(model_path=model_path)

# Service configuration
predict_result_service_endpoint = os.getenv("PREDICT_RESULT_SERVICE_ENDPOINT", "http://localhost:9002")
predict_result_api_key = os.getenv("API_KEY")
predict_result_api_secret = os.getenv("API_SECRET")

# Prediction configuration
NO_OBJECT_TIMEOUT = 30  # seconds
class_counts_accumulated = defaultdict(int)
total_count_accumulated = 0
predict_access_token = None
predict_refresh_token = None

def reset_accumulation():
    """Reset accumulated class counts and total count."""
    global class_counts_accumulated, total_count_accumulated
    class_counts_accumulated.clear()
    total_count_accumulated = 0

async def receive_initial_data(websocket: WebSocket):
    """Receive initial data from WebSocket."""
    try:
        data = await websocket.receive_json()
        logger.info(f"Received initial data: {data}")
        
        # ตรวจสอบว่าคีย์ที่ต้องการทั้งหมดอยู่ในข้อมูลที่ได้รับหรือไม่
        required_keys = ["inslot", "material", "batch", "plant", "operationno"]
        missing_keys = [key for key in required_keys if key not in data]

        if missing_keys:
            raise ValueError(f"Missing key(s): {', '.join(missing_keys)}")

        return data["inslot"], data["material"], data["batch"], data["plant"], data["operationno"]

    except ValueError as e:
        logger.error(f"Error receiving initial data: {e}")
        raise

def accumulate_detection(camera):
    """Accumulate detections from the camera."""
    global class_counts_accumulated, total_count_accumulated
    if camera.total_count > 0:
        for class_name, count in camera.class_counts.items():
            class_counts_accumulated[class_name] += count
        total_count_accumulated += camera.total_count

async def send_data_to_client(websocket: WebSocket, image_base64: str, mic_values: dict):
    """Send processed data to WebSocket client."""
    try:
        data = {
            "image": image_base64,
            "total_count": camera.total_count,
            "class_counts": camera.class_counts,
            "mic_values": mic_values
        }
        await websocket.send_json(data)
    except Exception as e:
        logger.error(f"Error sending data to client: {e}")

import time

async def login_to_predict_service(client: httpx.AsyncClient):
    global predict_access_token, predict_refresh_token
    retries = 5
    for attempt in range(retries):
        try:
            login_payload = {"apiKey": predict_result_api_key, "apiSecret": predict_result_api_secret}
            response = await client.post(f"{predict_result_service_endpoint}/v1/auth/login", json=login_payload)

            if response.status_code == 200:
                tokens = response.json()
                predict_access_token = tokens["accessToken"]
                predict_refresh_token = tokens["refreshToken"]
                logger.info("Logged in to predict-result-service successfully.")
                return
            elif response.status_code == 429:
                wait_time = 15 * 60  # 15 minutes
                logger.error(f"Too many requests. Retrying in {wait_time // 60} minutes...")
                time.sleep(wait_time)
            else:
                logger.error(f"Login failed: {response.status_code} - {response.text}")
                raise Exception("Login to predict-result-service failed")
        except Exception as e:
            logger.error(f"Error during login to predict-result-service: {e}")
            if attempt < retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                logger.info(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise e

async def send_final_data_to_service(client: httpx.AsyncClient, final_data: dict):
    """Send accumulated data to predict-result-service."""
    try:
        headers = {"Authorization": f"Bearer {predict_access_token}"}
        response = await client.post(f"{predict_result_service_endpoint}/v1/results/predict-result", json=final_data, headers=headers)
        logger.info(f"Final result sent: {response.status_code}")
    except Exception as e:
        logger.error(f"Error sending final data to service: {e}")

@app.get("/v1/start_camera")
async def start_camera():
    if camera.open_camera():
        return {"status": "Camera started"}
    else:
        logger.error("Failed to start camera.")
        return {"status": "Failed to start camera"}

@app.get("/v1/stop_camera")
async def stop_camera():
    camera.close_camera()
    return {"status": "Camera stopped"}

@app.websocket("/v1/ws/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    
    # Logging connection open
    logger.info("WebSocket connection opened")

    try:
        inslot, material, batch, plant, operationno = await receive_initial_data(websocket)

        async with httpx.AsyncClient() as client:
            await login_to_predict_service(client)
            reset_accumulation()

            start_time = asyncio.get_event_loop().time()

            while True:
                camera.capture_image()
                if camera.current_frame is not None:
                    _, img_encoded = cv2.imencode('.jpg', camera.current_frame)
                    image_base64 = base64.b64encode(img_encoded).decode('utf-8')

                    # คำนวณ MIC values และสะสมการตรวจจับ
                    mic_values = camera.calculate_mic()
                    accumulate_detection(camera)

                    # ส่งข้อมูลภาพและข้อมูลที่อัปเดตให้ WebSocket Client
                    await send_data_to_client(websocket, image_base64, mic_values)

                if asyncio.get_event_loop().time() - start_time >= NO_OBJECT_TIMEOUT:
                    logger.info(f"No objects detected for {NO_OBJECT_TIMEOUT} seconds. Ending round.")
                    break

                await asyncio.sleep(0.5)  # Adjust delay as needed

            # Logging before sending final data
            logger.info("Sending final data to client...")

            mic_values_accumulated = camera.calculate_mic()
            final_data = {
                "inslot": inslot,
                "material": material,
                "batch": batch,
                "plant": plant,
                "operationno": operationno,
                "total_count": total_count_accumulated,
                "class_counts": dict(class_counts_accumulated),
                "mic_values": mic_values_accumulated
            }
            await send_final_data_to_service(client, final_data)

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()
        logger.info("WebSocket connection closed")

if __name__ == "__main__":
    host = os.getenv("PREDICT_SERVICE_HOST", "127.0.0.1")
    port = int(os.getenv("PREDICT_SERVICE_PORT", 9001))

    logger.info("Starting Uvicorn server...")
    uvicorn.run(app, host=host, port=port)
    logger.info("Uvicorn server started.")
