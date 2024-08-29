import React, { useRef, useEffect } from 'react';
import { startCamera, stopCamera, connectWebSocket } from '../services/cameraService';
import { CLASS_MAPPING } from '../utils/class_mapping';

function CameraStream({ inslot, material, batch, plant, operationno, onUpdateResults }) {
  const videoRef = useRef(null);

  useEffect(() => {
    async function initializeCamera() {
      await startCamera();

      const ws = connectWebSocket({
        inslot,
        material,
        batch,
        plant,
        operationno,
        onMessage: (data) => {
          const mappedResults = Object.entries(data.class_counts).map(([className, count]) => ({
            label: CLASS_MAPPING[className] || className, // แปลงชื่อคลาสตาม CLASS_MAPPING
            value: count,
          }));

          onUpdateResults(mappedResults); // ส่งผลลัพธ์ไปที่ Home

          if (videoRef.current && data.image) {
            videoRef.current.src = `data:image/jpeg;base64,${data.image}`;
          }
        }
      });

      return () => {
        stopCamera();
        if (ws) {
          ws.close();
        }
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      };
    }

    initializeCamera();
  }, [inslot, material, batch, plant, operationno]);

  return (
    <div className="flex justify-center items-center w-full h-screen border-2 border-gray-300 rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay className="h-full w-full object-cover" />
    </div>
  );
}

export default CameraStream;
