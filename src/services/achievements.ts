import { useAchievementsStore } from '@/stores/achievementsStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { SavingsGoal } from '@/types';

class AchievementService {
  /**
   * Check and unlock achievements when a new goal is created
   */
  async checkGoalCreated(userId: string, goal: SavingsGoal) {
    const { unlockAchievement } = useAchievementsStore.getState();
    const { goals } = useGoalsStore.getState();
    
    // First goal achievement
    if (goals.length === 1) {
      await unlockAchievement(userId, 'FIRST_GOAL', { goalTitle: goal.title });
    }
  }

  /**
   * Check and unlock achievements when a contribution is made
   */
  async checkContribution(userId: string, goal: SavingsGoal, contributionAmount: number) {
    const { unlockAchievement } = useAchievementsStore.getState();
    const { getTotalSavings } = useGoalsStore.getState();
    
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const totalSavings = getTotalSavings();
    
    // First contribution achievement
    if (goal.currentAmount === contributionAmount) {
      await unlockAchievement(userId, 'FIRST_CONTRIBUTION', {});
    }
    
    // Progress milestones
    if (progress >= 25 && progress < 50) {
      await unlockAchievement(userId, 'GOAL_25_PERCENT', { goalTitle: goal.title });
    } else if (progress >= 50 && progress < 75) {
      await unlockAchievement(userId, 'GOAL_50_PERCENT', { goalTitle: goal.title });
    } else if (progress >= 75 && progress < 100) {
      await unlockAchievement(userId, 'GOAL_75_PERCENT', { goalTitle: goal.title });
    } else if (progress >= 100) {
      await unlockAchievement(userId, 'GOAL_COMPLETED', { goalTitle: goal.title });
    }
    
    // Total savings milestones
    if (totalSavings >= 1000) {
      await unlockAchievement(userId, 'SAVINGS_1000', { totalSavings });
    }
    if (totalSavings >= 5000) {
      await unlockAchievement(userId, 'SAVINGS_5000', { totalSavings });
    }
    if (totalSavings >= 10000) {
      await unlockAchievement(userId, 'SAVINGS_10000', { totalSavings });
    }
  }

  /**
   * Check for consistent saving patterns
   */
  async checkConsistentSaving(userId: string) {
    // This would require tracking contribution dates
    // For now, we'll implement a simplified version
    const { unlockAchievement } = useAchievementsStore.getState();
    
    // TODO: Implement actual consecutive days logic
    // await unlockAchievement(userId, 'CONSISTENT_SAVER', { consecutiveDays: 7 });
  }
}

export const achievementService = new AchievementService();
