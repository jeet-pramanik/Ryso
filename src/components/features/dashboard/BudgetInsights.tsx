import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Target, BarChart3, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBudgetStore } from '@/stores/budgetStore';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { cn } from '@/lib/utils';

interface BudgetInsightsProps {
  className?: string;
}

interface SpendingTrend {
  category: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  recommendation: string;
}

export default function BudgetInsights({ className }: BudgetInsightsProps) {
  const { getBudgetStats, currentBudget } = useBudgetStore();
  
  if (!currentBudget) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p>Set up a budget to see insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getBudgetStats();
  
  // Mock spending trends (would come from historical data in real app)
  const spendingTrends: SpendingTrend[] = [
    {
      category: 'Food & Dining',
      trend: 'up',
      change: 15,
      recommendation: 'Consider meal planning to reduce food expenses'
    },
    {
      category: 'Transportation',
      trend: 'down',
      change: -8,
      recommendation: 'Great job reducing transportation costs!'
    },
    {
      category: 'Entertainment',
      trend: 'up',
      change: 25,
      recommendation: 'Look for free entertainment alternatives'
    }
  ];

  const topSpendingCategories = stats.categoryBreakdown
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const efficiencyScore = Math.round(
    (stats.remaining / stats.totalAllocated) * 100
  );

  function getTrendIcon(trend: string) {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-success" />;
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  }

  function getTrendColor(trend: string) {
    switch (trend) {
      case 'up':
        return 'text-destructive';
      case 'down':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  }

  function getEfficiencyLabel(score: number): { label: string; color: string } {
    if (score >= 80) return { label: 'Excellent', color: 'text-success' };
    if (score >= 60) return { label: 'Good', color: 'text-primary' };
    if (score >= 40) return { label: 'Fair', color: 'text-warning' };
    return { label: 'Needs Improvement', color: 'text-destructive' };
  }

  const efficiency = getEfficiencyLabel(efficiencyScore);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget Efficiency</p>
                  <p className={cn("text-2xl font-bold", efficiency.color)}>
                    {efficiency.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {efficiencyScore}% remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold">
                    {stats.daysRemaining}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    in budget period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <PieChart className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Daily Spend</p>
                  <p className="text-2xl font-bold">
                    ₹{Math.round(stats.totalSpent / (30 - stats.daysRemaining) || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Spending Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSpendingCategories.map((category, index) => {
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-muted rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{category.category}</span>
                      <span className="text-sm font-medium">
                        ₹{category.spent.toFixed(0)} / ₹{category.allocated.toFixed(0)}
                      </span>
                    </div>
                    <Progress 
                      value={category.percentage} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.percentage.toFixed(0)}% used
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Spending Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spendingTrends.map((trend, index) => (
              <motion.div
                key={trend.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="mt-0.5">
                  {getTrendIcon(trend.trend)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{trend.category}</span>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getTrendColor(trend.trend))}
                    >
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {trend.recommendation}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>💡 Smart Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-lg">🎯</span>
              <div>
                <p className="text-sm font-medium">Stay on Track</p>
                <p className="text-xs text-muted-foreground">
                  You can spend ₹{Math.round(stats.remaining / stats.daysRemaining)} per day to stay within budget
                </p>
              </div>
            </div>
            
            {stats.totalSpent > stats.totalAllocated * 0.8 && (
              <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/10">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium">Slow Down</p>
                  <p className="text-xs text-muted-foreground">
                    You're approaching your budget limit. Consider reviewing your expenses.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/10">
              <span className="text-lg">📈</span>
              <div>
                <p className="text-sm font-medium">Build a Habit</p>
                <p className="text-xs text-muted-foreground">
                  Regular budget tracking leads to better financial outcomes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
