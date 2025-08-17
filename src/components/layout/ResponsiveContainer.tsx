import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      {/* Mobile-first container with max-width constraint */}
      <div 
        className={cn(
          "w-full max-w-md mx-auto bg-white shadow-xl relative min-h-screen",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default ResponsiveContainer;
