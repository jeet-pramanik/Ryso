import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, TrendingUp, Award, Calendar, DollarSign, BarChart3, Trophy } from 'lucide-react';
import { GoalCategory, GoalStatus, SavingsGoal } from '@/types';
import { useGoalsStore } from '@/stores/goalsStore';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/layout/AppHeader';
import AddContributionSheet from './AddContributionSheet';
import SavingsInsights from './SavingsInsights';
import AchievementsDisplay from './AchievementsDisplay';

const GoalsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const {
    goals,
    isLoading,
    isHydrated,
    getActiveGoals,
    getCompletedGoals,
    getTotalSavings,
    hydrate
  } = useGoalsStore();

  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [activeTab, setActiveTab] = useState('goals');

  useEffect(() => {
    if (!isHydrated && user?.id) {
      hydrate(user.id);
    }
  }, [isHydrated, user?.id, hydrate]);

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  const totalSavings = getTotalSavings();

  const filteredGoals = selectedCategory === 'all' 
    ? activeGoals 
    : activeGoals.filter(goal => goal.category === selectedCategory);

  const handleAddContribution = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setShowContributionModal(true);
  };

  const handleGoalClick = (goal: SavingsGoal) => {
    navigate(`/goals/${goal.id}`);
  };

  const categories = [
    { key: 'all' as const, label: 'All', icon: Target },
    { key: GoalCategory.EMERGENCY, label: 'Emergency', icon: Target },
    { key: GoalCategory.TRAVEL, label: 'Travel', icon: Target },
    { key: GoalCategory.GADGET, label: 'Gadgets', icon: Target },
    { key: GoalCategory.CAREER, label: 'Career', icon: Target },
    { key: GoalCategory.OTHER, label: 'Other', icon: Target },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTimeRemaining = (targetDate: Date) => {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader 
        title="Goals" 
        rightAction={
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/add-goal')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="p-4 bg-white border-b">
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total Savings</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(totalSavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Completed</p>
                  <p className="text-lg font-bold text-green-900">{completedGoals.length} Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="bg-white border-b px-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="goals" className="text-sm">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-sm">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Goals Tab Content */}
        <TabsContent value="goals" className="m-0">
          {/* Category Filter */}
          <div className="p-4 bg-white border-b">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className={cn(
                    "flex-shrink-0 text-xs",
                    selectedCategory === category.key 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-white hover:bg-gray-50"
                  )}
                >
                  <category.icon className="w-3 h-3 mr-1" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Goals List */}
          <div className="p-4 space-y-4">
            {filteredGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start your savings journey by creating your first goal. Every small step counts!
                </p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/add-goal')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGoals.map((goal) => {
                  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                  const timeRemaining = getTimeRemaining(new Date(goal.targetDate));
                  const isOverdue = new Date(goal.targetDate) < new Date();
                  
                  return (
                    <Card key={goal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Goal Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1" onClick={() => handleGoalClick(goal)}>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 text-sm">{goal.title}</h3>
                                <Badge variant={goal.category === GoalCategory.EMERGENCY ? 'destructive' : 'secondary'} className="text-xs">
                                  {goal.category}
                                </Badge>
                              </div>
                              {goal.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Progress</p>
                              <p className="text-sm font-semibold text-gray-900">{progress.toFixed(1)}%</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">
                                {formatCurrency(goal.currentAmount)}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(goal.targetAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Goal Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className={cn(
                                "text-xs",
                                isOverdue ? "text-red-600" : "text-muted-foreground"
                              )}>
                                {timeRemaining}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddContribution(goal);
                                }}
                              >
                                Add ₹
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGoalClick(goal);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Insights Tab Content */}
        <TabsContent value="insights" className="m-0">
          <div className="p-4">
            <SavingsInsights />
          </div>
        </TabsContent>

        {/* Achievements Tab Content */}
        <TabsContent value="achievements" className="m-0">
          <div className="p-4">
            <AchievementsDisplay />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Contribution Sheet */}
      <AddContributionSheet
        open={showContributionModal}
        onOpenChange={setShowContributionModal}
        goal={selectedGoal}
      />
    </div>
  );
};

export default GoalsDashboard;
