import axios from 'axios';

const CAMERA_API_URL = `${import.meta.env.VITE_REACT_APP_CAMERA_ENDPOINT}`;

export async function startCamera() {
  try {
    const response = await axios.get(`${CAMERA_API_URL}/v1/start_camera`);
    console.log('Camera started:', response.data);
  } catch (error) {
    console.error('Failed to start camera:', error);
  }
}

export async function stopCamera() {
  try {
    const response = await axios.get(`${CAMERA_API_URL}/v1/stop_camera`);
    console.log('Camera stopped:', response.data);
  } catch (error) {
    console.error('Failed to stop camera:', error);
  }
}

export function connectWebSocket({ inslot, material, batch, plant, operationno, onMessage }) {
  const ws = new WebSocket(`ws://${import.meta.env.VITE_REACT_APP_CAMERA_ENDPOINT}/v1/ws/stream`);

  ws.onopen = () => {
    console.log('WebSocket connection opened');

    // ส่งข้อมูลแรกเริ่มไปที่ WebSocket
    ws.send(JSON.stringify({
      inslot,
      material,
      batch,
      plant,
      operationno,
      apiKey: import.meta.env.VITE_REACT_APP_API_KEY,
      apiSecret: import.meta.env.VITE_REACT_APP_API_SECRET
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);

    // ส่งข้อมูลกลับไปที่ onMessage callback เพื่อจัดการใน CameraStream.jsx
    if (onMessage) {
      onMessage(data);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return ws;
}
