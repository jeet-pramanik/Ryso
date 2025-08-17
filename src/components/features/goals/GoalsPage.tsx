import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trophy, Calendar, TrendingUp } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CreateGoalModal from './CreateGoalModal';
import { generateDemoGoals, goalTemplates } from '@/services/demoData';
import { SavingsGoal, GoalStatus } from '@/types';

export default function GoalsPage() {
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [goals] = useState<SavingsGoal[]>(generateDemoGoals('demo-user-1'));

  const activeGoals = goals.filter(goal => goal.status === GoalStatus.ACTIVE);
  const completedGoals = goals.filter(goal => goal.status === GoalStatus.COMPLETED);
  
  const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTargets = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTargets > 0 ? (totalSavings / totalTargets) * 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffInTime = target.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    return Math.max(0, diffInDays);
  };

  const getGoalProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Goals" 
        showNotifications={false}
        rightAction={
          <Button 
            onClick={() => setShowCreateGoal(true)}
            size="sm"
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        }
      />
      
      <main className="pb-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-success to-success/80 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Total Savings</p>
                <p className="text-2xl font-bold">₹{totalSavings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Target className="h-6 w-6" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Progress</span>
                <span>{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-white/80 text-sm">
                ₹{(totalTargets - totalSavings).toLocaleString()} more to reach all goals
              </p>
            </div>
          </motion.div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Active Goals</h3>
                <span className="text-sm text-muted-foreground">{activeGoals.length} goals</span>
              </div>
              
              <div className="space-y-4">
                {activeGoals.map((goal, index) => {
                  const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
                  const daysRemaining = getDaysRemaining(goal.targetDate);
                  
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                          {goal.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            ₹{goal.currentAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            of ₹{goal.targetAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress.toFixed(1)}% complete</span>
                          <span>{daysRemaining} days left</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          Add Money
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Goal Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Goal Ideas</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {goalTemplates.slice(0, 4).map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => setShowCreateGoal(true)}
                  className="p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <h4 className="font-medium text-foreground text-sm mb-1">{template.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                  <p className="text-xs font-semibold text-primary">₹{template.targetAmount.toLocaleString()}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Achievements</h3>
              <Trophy className="h-5 w-5 text-warning" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-warning/5 border border-warning/20">
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-xs font-medium text-foreground">First Goal</p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
              
              <div className="text-center p-3 rounded-xl bg-success/5 border border-success/20">
                <div className="text-2xl mb-1">💰</div>
                <p className="text-xs font-medium text-foreground">Saver</p>
                <p className="text-xs text-muted-foreground">₹1000+</p>
              </div>
              
              <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-2xl mb-1 opacity-50">🎯</div>
                <p className="text-xs font-medium text-muted-foreground">Goal Master</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Savings Stats</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-success">{completedGoals.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">₹{Math.round(totalSavings / 30)}</p>
                <p className="text-sm text-muted-foreground">Daily Avg</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-warning">{Math.round(overallProgress)}%</p>
                <p className="text-sm text-muted-foreground">Overall</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <CreateGoalModal 
        isOpen={showCreateGoal} 
        onClose={() => setShowCreateGoal(false)} 
      />
    </div>
  );
}