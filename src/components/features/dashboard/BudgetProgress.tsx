import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  className?: string;
}

const sizes = {
  sm: { diameter: 60, strokeWidth: 4 },
  md: { diameter: 120, strokeWidth: 6 },
  lg: { diameter: 160, strokeWidth: 8 }
};

export default function BudgetProgress({
  percentage,
  size = 'md',
  showPercentage = true,
  strokeWidth,
  color,
  backgroundColor = '#f3f4f6',
  children,
  className
}: BudgetProgressProps) {
  const { diameter, strokeWidth: defaultStrokeWidth } = sizes[size];
  const radius = (diameter - (strokeWidth || defaultStrokeWidth)) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on percentage if not provided
  const getProgressColor = () => {
    if (color) return color;
    
    if (percentage <= 60) return '#10B981'; // Success green
    if (percentage <= 85) return '#F59E0B'; // Warning orange
    return '#EF4444'; // Critical red
  };

  const progressColor = getProgressColor();

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: diameter, height: diameter }}
    >
      <svg
        className="transform -rotate-90"
        width={diameter}
        height={diameter}
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth || defaultStrokeWidth}
          stroke={backgroundColor}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth || defaultStrokeWidth}
          stroke={progressColor}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
      </svg>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={cn(
                "font-bold",
                size === 'sm' ? "text-xs" : size === 'md' ? "text-lg" : "text-2xl"
              )}
              style={{ color: progressColor }}
            >
              {Math.round(percentage)}%
            </motion.div>
            {size !== 'sm' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className={cn(
                  "text-muted-foreground",
                  size === 'md' ? "text-xs" : "text-sm"
                )}
              >
                spent
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
