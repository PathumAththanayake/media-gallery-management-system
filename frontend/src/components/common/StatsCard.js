import React from 'react';

const StatsCard = ({ icon, value, label, className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
};

export default StatsCard; 