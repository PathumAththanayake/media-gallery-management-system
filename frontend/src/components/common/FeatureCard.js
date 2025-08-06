import React from 'react';

const FeatureCard = ({ icon, title, description, color = 'bg-blue-500', className = '' }) => {
  return (
    <div
      className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${className}`}
    >
      <div className={`inline-flex p-3 rounded-lg text-white mb-6 ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard; 