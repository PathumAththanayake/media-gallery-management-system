import React from 'react';

const TechnologyCard = ({ letter, name, description, color = 'bg-blue-500', className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      <div className={`w-16 h-16 ${color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
        <span className="text-white font-bold text-lg">{letter}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default TechnologyCard; 