import React, { useState, useEffect } from 'react';
import { FaQrcode } from 'react-icons/fa'; // นำเข้าไอคอน QR Code

function QRScanner({ onScan }) {
  const [scanResult, setScanResult] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    setScanResult(value);

    if (value && onScan) {
      onScan(value); // ส่งผลลัพธ์กลับไปยังฟังก์ชันที่รับ props onScan
    }
  };

  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setScanResult(''); // เคลียร์ค่าหลังจาก 30 วินาที
      }, 30000); // 30000 มิลลิวินาที = 30 วินาที

      return () => clearTimeout(timer); // ล้าง timer เมื่อ component ถูก unmount หรือเมื่อ scanResult เปลี่ยน
    }
  }, [scanResult]);

  return (
    <div className="grid grid-cols-3 gap-4 w-full justify-end"> {/* ใช้ Grid และจัดให้อยู่ชิดขวา */}
      <div className="relative col-span-2"> {/* คอลัมน์ที่สอง (ผลลัพธ์) */}
        {scanResult && (
          <div className="relative col-span-2"> {/* คอลัมน์ที่สอง (ผลลัพธ์) */}
            <div className="p-2 rounded text-right"> {/* ปรับตำแหน่งและขนาดและจัดข้อความชิดขวา */}
              <p className="text-lg font-semibold text-blue-500">Scanned Result: {scanResult}</p>
            </div>
          </div>
        )}
      </div>
      <div className="relative col-span-1"> {/* คอลัมน์แรก */}
        <input
          type="text"
          className="input input-bordered w-full pl-10 "  // เพิ่ม padding ซ้ายสำหรับไอคอน
          value={scanResult}
          onChange={handleInputChange}
          placeholder="Scan QR Code here"
          autoFocus
        />
        <FaQrcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> {/* ไอคอน QR Code */}
      </div>
    </div>
  );
}

export default QRScanner;
