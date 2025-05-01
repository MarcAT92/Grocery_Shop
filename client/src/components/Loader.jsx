import React from 'react';

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center h-60">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
