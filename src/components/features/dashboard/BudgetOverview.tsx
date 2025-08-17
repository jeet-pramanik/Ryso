import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useBudgetStore } from '@/stores/budgetStore';
import { Button } from '@/components/ui/button';

export default function BudgetOverview() {
  const { currentBudget, getBudgetStats, getBudgetAlert } = useBudgetStore();
  
  if (!currentBudget) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-gradient-primary relative overflow-hidden"
      >
        <div className="text-center py-8 text-white">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold mb-2">No Budget Set</h3>
          <p className="text-white/80 text-sm">Set up your budget to start tracking</p>
        </div>
      </motion.div>
    );
  }

  const stats = getBudgetStats();
  const alert = getBudgetAlert();
  
  const getStatusIcon = () => {
    switch (alert.type) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
    }
  };
  
  const getStatusColor = () => {
    switch (alert.type) {
      case 'healthy':
        return 'text-white';
      case 'warning':
        return 'text-warning';
      case 'critical':
        return 'text-destructive';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="card-gradient-primary relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full border-2 border-white/10" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Monthly Budget</h3>
          {getStatusIcon()}
        </div>
        
        <div className="space-y-4">
          {/* Budget Progress */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl font-bold text-white">
                ₹{stats.totalSpent.toLocaleString()}
              </span>
              <span className="text-white/80">
                of ₹{stats.totalAllocated.toLocaleString()}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  alert.type === 'healthy' 
                    ? 'bg-white' 
                    : alert.type === 'warning'
                    ? 'bg-warning'
                    : 'bg-destructive'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(alert.percentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
          
          {/* Status and Remaining */}
          <div className="flex justify-between items-center">
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {alert.message}
              </p>
              <p className="text-white/80 text-sm">
                {stats.daysRemaining} days remaining
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-xl font-bold text-white">
                ₹{Math.abs(stats.remaining).toLocaleString()}
              </p>
              <p className="text-white/80 text-sm">
                {stats.remaining >= 0 ? 'remaining' : 'over budget'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}