import React, { useState } from 'react';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FilterPanel.css';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  className = "",
  isCollapsible = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    Object.keys(localFilters).forEach(key => {
      clearedFilters[key] = '';
    });
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value && value !== '' && value !== 'all'
  );

  return (
    <div className={`filter-panel ${className}`}>
      <div className="filter-header">
        <div className="filter-title">
          <FaFilter className="filter-icon" />
          <span>Filters</span>
        </div>
        {isCollapsible && (
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Media Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Media Type</label>
            <select
              value={localFilters.mediaType || 'all'}
              onChange={(e) => handleFilterChange('mediaType', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={localFilters.category || 'all'}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="nature">Nature</option>
              <option value="technology">Technology</option>
              <option value="art">Art</option>
              <option value="travel">Travel</option>
              <option value="food">Food</option>
              <option value="people">People</option>
              <option value="architecture">Architecture</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <select
              value={localFilters.dateRange || 'all'}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Size Filter */}
          <div className="filter-group">
            <label className="filter-label">File Size</label>
            <select
              value={localFilters.fileSize || 'all'}
              onChange={(e) => handleFilterChange('fileSize', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sizes</option>
              <option value="small">Small (&lt; 1MB)</option>
              <option value="medium">Medium (1-10MB)</option>
              <option value="large">Large (&gt; 10MB)</option>
            </select>
          </div>

          {/* Privacy Filter */}
          <div className="filter-group">
            <label className="filter-label">Privacy</label>
            <select
              value={localFilters.privacy || 'all'}
              onChange={(e) => handleFilterChange('privacy', e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              className="clear-filters-button"
              onClick={clearAllFilters}
              type="button"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 