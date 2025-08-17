import { BaseRepository } from './BaseRepository';
import { SavingsGoal, GoalStatus } from '@/types';
import { db } from '@/services/database';

export class GoalsRepository extends BaseRepository<SavingsGoal> {
  constructor() {
    super(db.goals);
  }

  async getByUserId(userId: string): Promise<SavingsGoal[]> {
    return await this.table.where('userId').equals(userId).toArray();
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

  async addContribution(goalId: string, amount: number): Promise<number> {
    const goal = await this.getById(goalId);
    if (!goal) throw new Error('Goal not found');
    
    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;
    
    return await this.update(goalId, {
      currentAmount: newAmount,
      status: isCompleted ? GoalStatus.COMPLETED : goal.status,
      updatedAt: new Date().toISOString()
    });
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
}

export const goalsRepository = new GoalsRepository();
