import React, { useRef, useEffect } from 'react';
import { startCamera, stopCamera, connectWebSocket } from '../services/cameraService';
import { CLASS_MAPPING } from '../utils/class_mapping';

function CameraStream({ onUpdateResults }) {
  const imgRef = useRef(null);
  const wsRef = useRef(null);

  // Mock data สำหรับทดสอบ
  const inslot = "slot1";
  const material = "material1";
  const batch = "batch1";
  const plant = "plant1";
  const operationno = "op123";

  useEffect(() => {
    async function initializeCamera() {
      console.log("Initializing camera...");
      await startCamera();

      const ws = connectWebSocket({
        inslot,
        material,
        batch,
        plant,
        operationno,
        onMessage: (data) => {
          console.log("WebSocket data received:", data);

          const mappedResults = Object.entries(data.class_counts).map(([className, count]) => ({
            label: CLASS_MAPPING[className] || className,
            value: count,
          }));

          onUpdateResults(mappedResults);

          if (imgRef.current && data.image) {
            console.log("Setting image to img element...");
            imgRef.current.src = `data:image/jpeg;base64,${data.image}`;
          } else {
            console.error("Image data is missing or imgRef is null");
          }
        }
      });

      wsRef.current = ws;

      return () => {
        stopCamera();
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }

    initializeCamera();
  }, [inslot, material, batch, plant, operationno, onUpdateResults]);

  return (
    <div className="flex justify-center items-center w-[1950px] h-[1100px] border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
      <img 
        ref={imgRef} 
        alt="Camera stream" 
        className="object-contain w-full h-full m-4 rounded-lg"
        style={{ maxHeight: '100%', maxWidth: '100%' }}  
      />
    </div>
  );  
  
}

export default CameraStream;
