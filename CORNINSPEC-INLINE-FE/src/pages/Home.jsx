import React, { useState } from 'react';
import CameraStream from '../components/CameraStream';
import PredictResult from '../components/PredictResult';
import MicResult from '../components/MicResult';
import QRScanner from '../components/QRScanner';

const defaultPredictResults = [
  { label: 'เมล็ดดี', value: '0' },
  { label: 'เมล็ดแตกดี', value: '0' },
  { label: 'เมล็ดน้ำผึ้ง', value: '0' },
  { label: 'เมล็ดเน่า', value: '0' },
  { label: 'แมลงทำลาย', value: '0' },
  { label: 'ซัง', value: '0' },
  { label: 'เมล็ดคลุกยา', value: '0' },
  { label: 'เมล็ดราใน', value: '0' },
  { label: 'เมล็ดเสีย', value: '0' },
  { label: 'เมล็ดรานอก', value: '0' },
  { label: 'เมล็ดราขาว', value: '0' },
  { label: 'เมล็ดแตกเสีย', value: '0' },
];

function Home() {
  const [predictResults, setPredictResults] = useState(defaultPredictResults);
  const [micData, setMicData] = useState([
    { label: 'PHYS0003', value: '0%' },
    { label: 'PHYS0004', value: '0%' },
    { label: 'PHYS0005', value: '0%' },
    { label: 'PHYS0006', value: '0%' },
    { label: 'PHYS0007', value: '0%' },
    { label: 'PHYS0008', value: '0%' },
    { label: 'PHYS0009', value: '0%' },
  ]);

  const handleScan = (scanData) => {
    console.log('Scanned data:', scanData);
  };

  const handleUpdateResults = (results) => {
    // อัปเดตค่า predictResults
    const updatedResults = defaultPredictResults.map((defaultResult) => {
      const updatedResult = results.find(result => result.label === defaultResult.label);
      return updatedResult ? updatedResult : defaultResult;
    });

    setPredictResults(updatedResults);

    // คำนวณค่า micData
    const total_count = updatedResults.reduce((acc, result) => acc + parseInt(result.value, 10), 0);

    const classCounts = updatedResults.reduce((acc, result) => {
      acc[result.label] = parseInt(result.value, 10);
      return acc;
    }, {});

    const phys0003 = ((classCounts['เมล็ดเสีย'] || 0) + 
                      (classCounts['เมล็ดน้ำผึ้ง'] || 0) + 
                      (classCounts['แมลงทำลาย'] || 0) + 
                      (classCounts['เมล็ดแตกเสีย'] || 0) + 
                      (classCounts['เมล็ดเน่า'] || 0)) / total_count * 100;

    const phys0004 = (classCounts['เมล็ดแตกดี'] || 0) / total_count * 100;

    const phys0005 = (classCounts['เมล็ดราใน'] || 0) / total_count * 100;

    const phys0007 = ((classCounts['เมล็ดรานอก'] || 0) + 
                      (classCounts['เมล็ดราขาว'] || 0)) / total_count * 100;

    const phys0008 = (classCounts['เมล็ดคลุกยา'] || 0) / total_count * 100;

    const phys0009 = (classCounts['ซัง'] || 0) / total_count * 100;

    const newMicData = [
      { label: 'PHYS0003', value: `${phys0003.toFixed(1)}%` },
      { label: 'PHYS0004', value: `${phys0004.toFixed(1)}%` },
      { label: 'PHYS0005', value: `${phys0005.toFixed(1)}%` },
      { label: 'PHYS0006', value: '0%' }, // Fixed value as specified
      { label: 'PHYS0007', value: `${phys0007.toFixed(1)}%` },
      { label: 'PHYS0008', value: `${phys0008.toFixed(1)}%` },
      { label: 'PHYS0009', value: `${phys0009.toFixed(1)}%` },
    ];

    setMicData(newMicData);
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="flex justify-center items-center w-full mb-1">
        <div className="w-full">
          <QRScanner onScan={handleScan} />
        </div>
      </div>

      <div className="relative w-full">
        <CameraStream onUpdateResults={handleUpdateResults} />
        <MicResult micData={micData} />
      </div>

      <div className="w-full mt-1">
        <PredictResult results={predictResults} />
      </div>
    </div>
  );
}

export default Home;
