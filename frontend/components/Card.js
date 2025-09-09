import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  onClick = null,
  ...props 
}) => {
  const baseClasses = 'rounded-2xl shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700';
  const hoverClasses = hover ? 'transform hover:scale-105 hover:shadow-xl' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' : 'bg-white dark:bg-gray-800';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

// Card Body Component
export const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Card Footer Component
export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

// Card Title Component
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

// Card Description Component
export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
    {children}
  </p>
);

export default Card;
