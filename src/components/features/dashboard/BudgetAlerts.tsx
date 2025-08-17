import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudgetStore } from '@/stores/budgetStore';
import { BUDGET_CONFIG } from '@/constants/app';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface BudgetAlert {
  id: string;
  type: 'healthy' | 'warning' | 'critical';
  title: string;
  message: string;
  percentage: number;
  category?: string;
  dismissible?: boolean;
  autoDismiss?: boolean;
  dismissAfter?: number; // milliseconds
}

interface BudgetAlertsProps {
  className?: string;
}

export default function BudgetAlerts({ className }: BudgetAlertsProps) {
  const { getBudgetAlert, getBudgetStats, currentBudget } = useBudgetStore();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  
  if (!currentBudget) return null;

  const mainAlert = getBudgetAlert();
  const stats = getBudgetStats();
  
  // Only show main alert if it's warning or critical
  const shouldShowMainAlert = mainAlert.type !== 'healthy';
  
  const alerts: BudgetAlert[] = [];

  // Add main alert only if it's not healthy
  if (shouldShowMainAlert) {
    alerts.push({
      id: 'main',
      type: mainAlert.type,
      title: getAlertTitle(mainAlert.type),
      message: mainAlert.message,
      percentage: mainAlert.percentage,
      dismissible: true,
      autoDismiss: mainAlert.type === 'warning',
      dismissAfter: 5000 // 5 seconds for warnings
    });
  }

  // Add only critical category alerts (over 100%)
  stats.categoryBreakdown.forEach(category => {
    if (category.percentage >= 100 && !dismissedAlerts.has(`category-${category.category}`)) {
      alerts.push({
        id: `category-${category.category}`,
        type: 'critical',
        title: `${category.category} Budget Exceeded`,
        message: `You've exceeded your ${category.category.toLowerCase()} budget by ₹${(category.spent - category.allocated).toFixed(0)}`,
        percentage: category.percentage,
        category: category.category,
        dismissible: true,
        autoDismiss: false
      });
    }
  });

  // Auto-dismiss alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.autoDismiss && alert.dismissAfter && !dismissedAlerts.has(alert.id)) {
        const timer = setTimeout(() => {
          handleDismiss(alert.id);
        }, alert.dismissAfter);

        return () => clearTimeout(timer);
      }
    });
  }, [alerts.length]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  function getAlertTitle(type: string): string {
    switch (type) {
      case 'healthy':
        return 'Budget on Track';
      case 'warning':
        return 'Budget Warning';
      case 'critical':
        return 'Budget Alert';
      default:
        return 'Budget Status';
    }
  }

  function getAlertIcon(type: string) {
    switch (type) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'critical':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  }

  function getAlertColors(type: string) {
    switch (type) {
      case 'healthy':
        return {
          bg: 'bg-success/10',
          border: 'border-success/20',
          text: 'text-success',
          icon: 'text-success'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/20',
          text: 'text-warning',
          icon: 'text-warning'
        };
      case 'critical':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/20',
          text: 'text-destructive',
          icon: 'text-destructive'
        };
      default:
        return {
          bg: 'bg-muted/10',
          border: 'border-muted/20',
          text: 'text-muted-foreground',
          icon: 'text-muted-foreground'
        };
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <AnimatePresence>
        {visibleAlerts.map((alert, index) => {
          const colors = getAlertColors(alert.type);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border",
                colors.bg,
                colors.border
              )}
            >
              <div className={cn("mt-0.5", colors.icon)}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={cn("font-semibold text-sm", colors.text)}>
                      {alert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message}
                    </p>
                    
                    {alert.percentage > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              alert.type === 'healthy' ? 'bg-success' :
                              alert.type === 'warning' ? 'bg-warning' : 'bg-destructive'
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(alert.percentage, 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                        <span className={cn("text-xs font-medium", colors.text)}>
                          {Math.round(alert.percentage)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {alert.dismissible && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-50 hover:opacity-100"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {visibleAlerts.length === 0 && (
        <div className="text-center py-2 text-muted-foreground">
          <p className="text-sm">✅ All good! No budget alerts.</p>
        </div>
      )}
    </div>
  );
}
