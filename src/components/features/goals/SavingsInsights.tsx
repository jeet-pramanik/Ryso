import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useGoalsStore } from '@/stores/goalsStore';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { GoalStatus, GoalCategory } from '@/types';
import { cn } from '@/lib/utils';

const SavingsInsights: React.FC = () => {
  const { goals, getTotalSavings, getActiveGoals, getCompletedGoals } = useGoalsStore();
  const { getTotalAchievements } = useAchievementsStore();

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  const totalSavings = getTotalSavings();
  const totalAchievements = getTotalAchievements();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Calculate category breakdown
  const categoryBreakdown = Object.values(GoalCategory).map(category => {
    const categoryGoals = goals.filter(goal => goal.category === category);
    const totalAmount = categoryGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const percentage = totalSavings > 0 ? (totalAmount / totalSavings) * 100 : 0;
    
    return {
      category,
      amount: totalAmount,
      percentage,
      goalCount: categoryGoals.length
    };
  }).filter(item => item.amount > 0);

  // Calculate average progress
  const avgProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount) * 100, 0) / activeGoals.length
    : 0;

  // Calculate velocity (simplified - based on goal creation dates)
  const getSavingsVelocity = () => {
    if (goals.length === 0) return 0;
    
    const oldestGoal = goals.reduce((oldest, goal) => 
      new Date(goal.createdAt) < new Date(oldest.createdAt) ? goal : oldest
    );
    
    const daysSinceStart = Math.max(1, Math.floor(
      (Date.now() - new Date(oldestGoal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ));
    
    return totalSavings / daysSinceStart;
  };

  const dailyVelocity = getSavingsVelocity();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Saved</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(totalSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Avg Progress</p>
                <p className="text-lg font-bold text-green-900">{avgProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium">Achievements</p>
                <p className="text-lg font-bold text-purple-900">{totalAchievements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium">Daily Rate</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(dailyVelocity)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Goals Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{goals.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Category Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({item.goalCount} goal{item.goalCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Progress */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No active goals to track. Create your first goal to start building insights!
            </p>
          ) : (
            <div className="space-y-3">
              {activeGoals.slice(0, 3).map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{goal.title}</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsInsights;
