import logging
import cv2
import os
import time
from pypylon import pylon
from ultralytics import YOLO
from class_colors import get_color_for_class

# Directory for saving images
save_directory = '/home/qi02/Quality_project/CORNINSPEC-INLINE/raw_images'

class BaslerCamera:
    def __init__(self, model_path):
        self.camera = None
        self.converter = pylon.ImageFormatConverter()
        # Setup converter for image processing
        self.converter.OutputPixelFormat = pylon.PixelType_BGR8packed
        self.converter.OutputBitAlignment = pylon.OutputBitAlignment_MsbAligned
        # Load the YOLO model
        self.model = YOLO(model_path)
        self.current_frame = None

    def open_camera(self):
        try:
            if pylon.TlFactory.GetInstance().EnumerateDevices():
                self.camera = pylon.InstantCamera(pylon.TlFactory.GetInstance().CreateFirstDevice())
                self.camera.Open()
                logging.info(f"Using Camera: {self.camera.GetDeviceInfo().GetModelName()}")
            else:
                logging.error("No Basler cameras found. Please check the connection.")
        except Exception as e:
            logging.error(f"Error opening camera: {e}")
            self.camera = None

    def save_image(self, image, directory, prefix="image"):
        if not os.path.exists(directory):
            os.makedirs(directory)

        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"{prefix}_{timestamp}.jpg"
        filepath = os.path.join(directory, filename)
        cv2.imwrite(filepath, image)
        logging.info(f"Image saved: {filepath}")

    def define_roi(self, image, x, y, width, height):
        return image[y:y + height, x:x + width]
    
    def calculate_mic(self):
        if self.total_count == 0:
            return {
                "phys0003": 0,
                "phys0004": 0,
                "phys0005": 0,
                "phys0006": 0,
                "phys0007": 0,
                "phys0008": 0,
                "phys0009": 0,
            }

        phys0003 = ((self.class_counts.get("damaged", 0) +
                    self.class_counts.get("honey", 0) +
                    self.class_counts.get("insect", 0) +
                    self.class_counts.get("badlycracked", 0) +
                    self.class_counts.get("rotten", 0)) / self.total_count) * 100

        phys0004 = (self.class_counts.get("goodcracked", 0) / self.total_count) * 100

        phys0005 = (self.class_counts.get("infungus", 0) / self.total_count) * 100

        phys0006 = 0  # Fixed value as specified

        phys0007 = ((self.class_counts.get("exfungus", 0) +
                    self.class_counts.get("whfungus", 0)) / self.total_count) * 100

        phys0008 = (self.class_counts.get("coated", 0) / self.total_count) * 100

        phys0009 = (self.class_counts.get("corncob", 0) / self.total_count) * 100

        return {
            "phys0003": phys0003,
            "phys0004": phys0004,
            "phys0005": phys0005,
            "phys0006": phys0006,
            "phys0007": phys0007,
            "phys0008": phys0008,
            "phys0009": phys0009,
        }
        
    def capture_image(self):
        if self.camera is None or not self.camera.IsOpen():
            logging.error("Camera is not initialized, opened, or available.")
            return None

        try:
            self.camera.StartGrabbing(pylon.GrabStrategy_LatestImageOnly)

            grabResult = self.camera.RetrieveResult(5000, pylon.TimeoutHandling_ThrowException)
            if grabResult.GrabSucceeded():
                image = self.converter.Convert(grabResult)
                img = image.GetArray()

                width_desired = 1100
                height_desired = 600
                resized_img = cv2.resize(img, (width_desired, height_desired))

                roi_x, roi_y, roi_width, roi_height = 30, 160, 1040, 400
                roi = self.define_roi(resized_img, roi_x, roi_y, roi_width, roi_height)

                results = self.model.predict(source=roi)

                total_count = 0
                class_counts = {}

                for result in results:
                    for box in result.boxes:
                        class_id = int(box.cls[0])
                        class_name = result.names[class_id]
                        confidence = box.conf[0]
                        bbox = box.xyxy[0].cpu().numpy().astype(int)

                        bbox[0] += roi_x
                        bbox[1] += roi_y
                        bbox[2] += roi_x
                        bbox[3] += roi_y

                        color = get_color_for_class(class_name)
                        cv2.rectangle(resized_img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color=color, thickness=2)

                        label = f"{class_name} {confidence:.2f}"
                        cv2.putText(resized_img, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

                        # Update total count
                        total_count += 1

                        # Update class count
                        if class_name in class_counts:
                            class_counts[class_name] += 1
                        else:
                            class_counts[class_name] = 1

                self.current_frame = resized_img
                self.total_count = total_count 
                self.class_counts = class_counts 

                grabResult.Release()
            else:
                grabResult.Release()
        except Exception as e:
            logging.error(f"An error occurred during image capture: {e}")
        finally:
            if self.camera and self.camera.IsGrabbing():
                self.camera.StopGrabbing()

    def close_camera(self):
        if self.camera and self.camera.IsOpen():
            try:
                self.camera.Close()
            except Exception as e:
                logging.error(f"Error closing camera: {e}")
