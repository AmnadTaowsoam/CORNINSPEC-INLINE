import React from 'react';

function PredictResult({ results }) {
  // กำหนดกลุ่มของผลลัพธ์ที่เป็นของดีและของเสีย
  const goodResults = ['เมล็ดดี', 'เมล็ดแตกดี'];
  const badResults = [
    'เมล็ดน้ำผึ้ง', 'เมล็ดเน่า', 'แมลงทำลาย', 'ซัง', 
    'เมล็ดคลุกยา', 'เมล็ดราใน', 'เมล็ดเสีย', 
    'เมล็ดรานอก', 'เมล็ดราขาว', 'เมล็ดแตกเสีย'
  ];

  // คำนวณจำนวนทั้งหมดของเมล็ด
  const totalSeeds = results.reduce((acc, result) => acc + parseInt(result.value, 10), 0) || 1;

  return (
    <div className="p-2 bg-white rounded-lg shadow-md w-full">
      <div className="grid grid-flow-col gap-2 auto-cols-fr">
        {results.map((result, index) => {
          // กำหนดสีตามประเภทของผลลัพธ์
          const isGood = goodResults.includes(result.label);
          const cardColor = isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

          // คำนวณความกว้างของ progress bar
          const percentage = (parseInt(result.value, 10) / totalSeeds) * 100;

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-2 rounded-lg shadow-basic ${cardColor} w-full`}
            >
              <span className="text-xs font-semibold">{result.label}</span>
              <span className="text-lg font-bold">{result.value}</span>
              <div className="w-full mt-1 flex items-center">
                <span className="text-xs font-semibold mr-2">{percentage.toFixed(1)}%</span>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isGood ? '#4caf50' : '#f44336',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PredictResult;
