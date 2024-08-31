import React from 'react';

function MicResult({ micData }) {
  return (
    <div className="absolute top-2 right-2 p-2 bg-white bg-opacity-75 rounded-lg shadow-md text-basic w-48">
      <h3 className="text-xl font-bold mb-1">MIC Results</h3>
      <ul>
        {micData.map((item, index) => (
          <li key={index} className="mb-1">
            <span className="font-bold">{item.label}: </span>
            <span>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MicResult;
