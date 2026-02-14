import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="modern-spinner"></div>
      <p className="mt-4 text-sm font-medium text-blue-400 animate-pulse">
        Analyzing document...
      </p>
    </div>
  );
};

export default LoadingSpinner;
