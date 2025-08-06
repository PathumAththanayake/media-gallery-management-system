import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import './StatsCard.css';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'percentage', 
  icon, 
  color = 'blue',
  trend = 'neutral',
  className = ""
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="trend-icon up" />;
      case 'down':
        return <FaArrowDown className="trend-icon down" />;
      default:
        return <FaMinus className="trend-icon neutral" />;
    }
  };

  const getTrendClass = () => {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-neutral';
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const formatChange = (val, type) => {
    if (type === 'percentage') {
      return `${val > 0 ? '+' : ''}${val}%`;
    }
    return formatValue(val);
  };

  return (
    <div className={`stats-card stats-${color} ${className}`}>
      <div className="stats-header">
        <div className="stats-icon">
          {icon}
        </div>
        <div className={`trend-indicator ${getTrendClass()}`}>
          {getTrendIcon()}
        </div>
      </div>
      
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <div className="stats-value">{formatValue(value)}</div>
        
        {change !== undefined && change !== null && (
          <div className={`stats-change ${getTrendClass()}`}>
            {getTrendIcon()}
            <span className="change-value">
              {formatChange(change, changeType)}
            </span>
            <span className="change-period">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 