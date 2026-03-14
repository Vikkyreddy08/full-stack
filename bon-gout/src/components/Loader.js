import React from 'react';

const Loader = ({ className = 'h-64 w-full' }) => (
  <div 
    className={`space-y-4 animate-pulse bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl p-8 flex flex-col justify-center items-center ${className}`}
    role="status"
    aria-label="Loading"
  >
    <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    <div className="h-6 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl w-3/4"></div>
    <div className="h-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded w-1/2"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

export default Loader;
