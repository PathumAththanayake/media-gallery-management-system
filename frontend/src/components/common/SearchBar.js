import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search media...", 
  initialValue = "",
  className = "",
  showClearButton = true 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((term) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className={`search-bar-container ${className}`}>
      <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="search-input"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {showClearButton && searchTerm && (
          <button 
            className="clear-button" 
            onClick={handleClear}
            type="button"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchBar; 