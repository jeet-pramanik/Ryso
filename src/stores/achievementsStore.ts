import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Achievement } from '@/types';
import { achievementsRepository } from '@/services/repositories/AchievementsRepository';

interface AchievementsState {
  achievements: Achievement[];
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  
  // Actions
  hydrate: (userId: string) => Promise<void>;
  unlockAchievement: (userId: string, achievementType: string, data: any) => Promise<Achievement | null>;
  getUnlockedAchievements: () => Achievement[];
  getRecentAchievements: (days?: number) => Achievement[];
  getTotalAchievements: () => number;
}

export const useAchievementsStore = create<AchievementsState>()(
  devtools(
    (set, get) => ({
      achievements: [],
      isLoading: false,
      isHydrated: false,
      error: null,

      hydrate: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const achievements = await achievementsRepository.getByUserId(userId);
          set({ achievements, isHydrated: true });
        } catch (error) {
          console.error('Error hydrating achievements:', error);
          set({ error: 'Failed to load achievements' });
        } finally {
          set({ isLoading: false });
        }
      },

      unlockAchievement: async (userId: string, achievementType: string, data: any) => {
        try {
          const achievement = await achievementsRepository.checkAndUnlock(userId, achievementType, data);
          if (achievement) {
            set(state => ({
              achievements: [...state.achievements, achievement]
            }));
          }
          return achievement;
        } catch (error) {
          console.error('Error unlocking achievement:', error);
          return null;
        }
      },

      getUnlockedAchievements: () => {
        return get().achievements;
      },

      getRecentAchievements: (days = 7) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return get().achievements.filter(
          achievement => new Date(achievement.unlockedAt) >= cutoffDate
        );
      },

      getTotalAchievements: () => {
        return get().achievements.length;
      },
    }),
    {
      name: 'achievements-store',
    }
  )
);
