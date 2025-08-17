import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  TrendingUp, 
  Edit, 
  Pause, 
  Play, 
  Trash2,
  Plus,
  CheckCircle
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useGoalsStore } from '@/stores/goalsStore';
import { GoalStatus } from '@/types';
import { cn } from '@/lib/utils';
import AddContributionSheet from '@/components/features/goals/AddContributionSheet';

const GoalDetailPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { getGoalById, pauseGoal, resumeGoal, deleteGoal } = useGoalsStore();
  const [showContributionSheet, setShowContributionSheet] = useState(false);

  const goal = goalId ? getGoalById(goalId) : null;

  useEffect(() => {
    if (!goal) {
      navigate('/goals');
    }
  }, [goal, navigate]);

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Goal not found</p>
          <Button onClick={() => navigate('/goals')} className="mt-4">
            Back to Goals
          </Button>
        </div>
      </div>
    );
  }

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
  const isOverdue = daysRemaining < 0;
  const isCompleted = goal.status === GoalStatus.COMPLETED || progress >= 100;
  const isPaused = goal.status === GoalStatus.PAUSED;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTimeRemaining = () => {
    if (isCompleted) return 'Completed';
    if (isOverdue) return `${Math.abs(daysRemaining)} days overdue`;
    if (daysRemaining === 0) return 'Due today';
    if (daysRemaining === 1) return '1 day left';
    if (daysRemaining < 7) return `${daysRemaining} days left`;
    if (daysRemaining < 30) return `${Math.ceil(daysRemaining / 7)} weeks left`;
    return `${Math.ceil(daysRemaining / 30)} months left`;
  };

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await resumeGoal(goal.id);
      } else {
        await pauseGoal(goal.id);
      }
    } catch (error) {
      console.error('Error updating goal status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      try {
        await deleteGoal(goal.id);
        navigate('/goals');
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  // Generate milestones for timeline
  const milestones = [
    { percentage: 25, amount: goal.targetAmount * 0.25, reached: progress >= 25 },
    { percentage: 50, amount: goal.targetAmount * 0.5, reached: progress >= 50 },
    { percentage: 75, amount: goal.targetAmount * 0.75, reached: progress >= 75 },
    { percentage: 100, amount: goal.targetAmount, reached: progress >= 100 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/goals')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Goal Details</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Edit className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Goal Overview */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Goal Header */}
              <div className="flex items-start space-x-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: goal.color }}
                >
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 truncate">{goal.title}</h2>
                    <Badge 
                      variant={isCompleted ? 'default' : isPaused ? 'secondary' : 'outline'}
                      className={cn(
                        isCompleted && 'bg-green-500 text-white',
                        isPaused && 'bg-gray-500 text-white'
                      )}
                    >
                      {isCompleted ? 'Completed' : isPaused ? 'Paused' : 'Active'}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-muted-foreground text-sm">{goal.description}</p>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-lg font-bold text-gray-900">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">{formatCurrency(goal.currentAmount)}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(remainingAmount)}</p>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-2xl font-bold",
                    isOverdue ? "text-red-600" : "text-gray-900"
                  )}>
                    {getTimeRemaining()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Timeline */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Milestones</h3>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.percentage} className="flex items-center space-x-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    milestone.reached 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {milestone.reached ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-medium">{milestone.percentage}%</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "font-medium",
                        milestone.reached ? "text-green-700" : "text-gray-700"
                      )}>
                        {milestone.percentage}% Milestone
                      </span>
                      <span className={cn(
                        "text-sm",
                        milestone.reached ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {formatCurrency(milestone.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {!isCompleted && (
            <Button 
              onClick={() => setShowContributionSheet(true)}
              className="w-full h-12 text-base bg-primary hover:bg-primary/90"
              disabled={isPaused}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Contribution
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handlePauseResume}
              className="h-12"
              disabled={isCompleted}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Add Contribution Sheet */}
      <AddContributionSheet
        open={showContributionSheet}
        onOpenChange={setShowContributionSheet}
        goal={goal}
      />
    </div>
  );
};

export default GoalDetailPage;
