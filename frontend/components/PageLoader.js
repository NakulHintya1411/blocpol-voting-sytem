import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageLoader = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="xl" text={message} />
      </div>
    </div>
  );
};

export default PageLoader;
