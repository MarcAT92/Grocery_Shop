import React, { memo } from 'react';

const Loader = () => {
  return (
    <div 
      role="progressbar"
      aria-label="Loading content"
      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
    >
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    </div>
  );
};

export default memo(Loader);