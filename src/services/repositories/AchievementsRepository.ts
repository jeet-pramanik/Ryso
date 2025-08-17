import { Achievement } from '@/types';
import { BaseRepository } from './BaseRepository';
import { db } from '../database';

class AchievementsRepository extends BaseRepository<Achievement, string> {
  constructor() {
    super(db.achievements);
  }

  async getByUserId(userId: string): Promise<Achievement[]> {
    return db.achievements.where('userId').equals(userId).toArray();
  }

  async checkAndUnlock(userId: string, achievementType: string, data: any): Promise<Achievement | null> {
    // Check if achievement already exists
    const existing = await db.achievements
      .where(['userId', 'type'])
      .equals([userId, achievementType])
      .first();

    if (existing) {
      return null; // Already unlocked
    }

    // Check achievement rules
    const achievement = await this.evaluateAchievement(userId, achievementType, data);
    if (achievement) {
      const id = await db.achievements.add({ ...achievement, id: '' });
      return { ...achievement, id: id.toString() };
    }

    return null;
  }

  private async evaluateAchievement(userId: string, type: string, data: any): Promise<Omit<Achievement, 'id'> | null> {
    const now = new Date().toISOString();

    switch (type) {
      case 'FIRST_GOAL':
        return {
          userId,
          title: 'Goal Setter',
          description: 'Created your first savings goal',
          icon: 'Target',
          unlockedAt: now,
          type: 'GOAL'
        };

      case 'FIRST_CONTRIBUTION':
        return {
          userId,
          title: 'Savings Starter',
          description: 'Made your first contribution to a goal',
          icon: 'TrendingUp',
          unlockedAt: now,
          type: 'SAVINGS'
        };

      case 'GOAL_25_PERCENT':
        return {
          userId,
          title: 'Quarter Way There',
          description: 'Reached 25% of a savings goal',
          icon: 'Award',
          unlockedAt: now,
          type: 'GOAL'
        };

      case 'GOAL_50_PERCENT':
        return {
          userId,
          title: 'Halfway Hero',
          description: 'Reached 50% of a savings goal',
          icon: 'Medal',
          unlockedAt: now,
          type: 'GOAL'
        };

      case 'GOAL_75_PERCENT':
        return {
          userId,
          title: 'Almost There',
          description: 'Reached 75% of a savings goal',
          icon: 'Star',
          unlockedAt: now,
          type: 'GOAL'
        };

      case 'GOAL_COMPLETED':
        return {
          userId,
          title: 'Goal Achiever',
          description: `Completed your goal: ${data.goalTitle}`,
          icon: 'Trophy',
          unlockedAt: now,
          type: 'GOAL'
        };

      case 'SAVINGS_1000':
        if (data.totalSavings >= 1000) {
          return {
            userId,
            title: 'Thousand Saver',
            description: 'Saved ₹1,000 across all goals',
            icon: 'Coins',
            unlockedAt: now,
            type: 'SAVINGS'
          };
        }
        break;

      case 'SAVINGS_5000':
        if (data.totalSavings >= 5000) {
          return {
            userId,
            title: 'Five Grand',
            description: 'Saved ₹5,000 across all goals',
            icon: 'Banknote',
            unlockedAt: now,
            type: 'SAVINGS'
          };
        }
        break;

      case 'SAVINGS_10000':
        if (data.totalSavings >= 10000) {
          return {
            userId,
            title: 'Ten Thousand Club',
            description: 'Saved ₹10,000 across all goals',
            icon: 'Gem',
            unlockedAt: now,
            type: 'SAVINGS'
          };
        }
        break;

      case 'CONSISTENT_SAVER':
        if (data.consecutiveDays >= 7) {
          return {
            userId,
            title: 'Consistent Saver',
            description: 'Made contributions for 7 days in a row',
            icon: 'Calendar',
            unlockedAt: now,
            type: 'SAVINGS'
          };
        }
        break;

      default:
        return null;
    }

    return null;
  }
}

export const achievementsRepository = new AchievementsRepository();
