import { BaseRepository } from './BaseRepository';
import { SavingsGoal, GoalStatus, Milestone, GoalCategory } from '@/types';
import { db } from '@/services/database';
import { generateSampleGoals } from '@/data/sampleGoals';

export interface CreateGoalData {
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  category: GoalCategory;
  icon: string;
  color: string;
}

export interface GoalContribution {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export class GoalsRepository extends BaseRepository<SavingsGoal> {
  constructor() {
    super(db.goals);
  }

  async getByUserId(userId: string): Promise<SavingsGoal[]> {
    const goals = await this.table.where('userId').equals(userId).toArray();
    
    // If no goals exist for this user, seed some sample data
    if (goals.length === 0) {
      const sampleGoals = generateSampleGoals(userId);
      await this.table.bulkAdd(sampleGoals);
      return sampleGoals;
    }
    
    return goals;
  }

  async createGoal(data: CreateGoalData): Promise<SavingsGoal> {
    const now = new Date().toISOString();
    const goal: SavingsGoal = {
      id: crypto.randomUUID(),
      ...data,
      currentAmount: 0,
      status: GoalStatus.ACTIVE,
      milestones: this.generateMilestones(data.targetAmount),
      createdAt: now,
      updatedAt: now
    };

    await this.create(goal);
    return goal;
  }

  async getActiveGoals(userId: string): Promise<SavingsGoal[]> {
    return await this.table
      .where('userId')
      .equals(userId)
      .and(goal => goal.status === GoalStatus.ACTIVE)
      .toArray();
  }

  async getCompletedGoals(userId: string): Promise<SavingsGoal[]> {
    return await this.table
      .where('userId')
      .equals(userId)
      .and(goal => goal.status === GoalStatus.COMPLETED)
      .toArray();
  }

  async addContribution(goalId: string, amount: number, description?: string): Promise<SavingsGoal> {
    const goal = await this.getById(goalId);
    if (!goal) throw new Error('Goal not found');
    
    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;
    
    // Update milestones
    const updatedMilestones = this.updateMilestones(goal.milestones, newAmount, goal.targetAmount);
    
    const updatedGoal: Partial<SavingsGoal> = {
      currentAmount: newAmount,
      status: isCompleted ? GoalStatus.COMPLETED : goal.status,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    };

    await this.update(goalId, updatedGoal);
    
    // Return the updated goal
    const result = await this.getById(goalId);
    if (!result) throw new Error('Failed to retrieve updated goal');
    return result;
  }

  async pauseGoal(goalId: string): Promise<number> {
    return await this.update(goalId, {
      status: GoalStatus.PAUSED,
      updatedAt: new Date().toISOString()
    });
  }

  async resumeGoal(goalId: string): Promise<number> {
    return await this.update(goalId, {
      status: GoalStatus.ACTIVE,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.delete(goalId);
  }

  async getGoalProgress(goalId: string): Promise<{
    goal: SavingsGoal;
    progressPercentage: number;
    remainingAmount: number;
    daysRemaining: number;
    projectedCompletionDate?: string;
    monthlyTargetSuggestion: number;
    milestoneProgress: { reached: number; total: number };
  }> {
    const goal = await this.getById(goalId);
    if (!goal) throw new Error('Goal not found');

    const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
    
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const monthsRemaining = daysRemaining / 30;
    const monthlyTargetSuggestion = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
    
    const reachedMilestones = goal.milestones.filter(m => m.isCompleted).length;
    const milestoneProgress = {
      reached: reachedMilestones,
      total: goal.milestones.length
    };

    return {
      goal,
      progressPercentage,
      remainingAmount,
      daysRemaining,
      monthlyTargetSuggestion,
      milestoneProgress
    };
  }

  // Helper methods
  private generateMilestones(targetAmount: number): Milestone[] {
    const percentages = [25, 50, 75, 100];
    return percentages.map(percent => ({
      id: crypto.randomUUID(),
      amount: Math.round((targetAmount * percent) / 100),
      date: new Date().toISOString(),
      isCompleted: false
    }));
  }

  private updateMilestones(milestones: Milestone[], currentAmount: number, targetAmount: number): Milestone[] {
    return milestones.map(milestone => ({
      ...milestone,
      isCompleted: currentAmount >= milestone.amount,
      date: currentAmount >= milestone.amount && !milestone.isCompleted 
        ? new Date().toISOString() 
        : milestone.date
    }));
  }
}

export const goalsRepository = new GoalsRepository();
