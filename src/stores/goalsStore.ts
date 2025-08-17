import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SavingsGoal, GoalStatus, GoalCategory } from '@/types';
import { goalsRepository, CreateGoalData } from '@/services/repositories/GoalsRepository';
import { achievementService } from '@/services/achievements';

interface GoalsState {
  goals: SavingsGoal[];
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  
  // Actions
  hydrate: (userId: string) => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<SavingsGoal>;
  updateGoal: (goalId: string, data: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addContribution: (goalId: string, amount: number, description?: string) => Promise<void>;
  pauseGoal: (goalId: string) => Promise<void>;
  resumeGoal: (goalId: string) => Promise<void>;
  
  // Selectors
  getActiveGoals: () => SavingsGoal[];
  getCompletedGoals: () => SavingsGoal[];
  getPausedGoals: () => SavingsGoal[];
  getGoalById: (id: string) => SavingsGoal | undefined;
  getTotalSavings: () => number;
  getGoalsByCategory: (category: GoalCategory) => SavingsGoal[];
}

export const useGoalsStore = create<GoalsState>()(
  devtools(
    (set, get) => ({
      goals: [],
      isLoading: false,
      isHydrated: false,
      error: null,

      hydrate: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const goals = await goalsRepository.getByUserId(userId);
          set({ goals, isHydrated: true });
        } catch (error) {
          console.error('Error hydrating goals:', error);
          set({ error: 'Failed to load goals' });
        } finally {
          set({ isLoading: false });
        }
      },

      createGoal: async (data: CreateGoalData) => {
        try {
          set({ isLoading: true, error: null });
          const newGoal = await goalsRepository.createGoal(data);
          set(state => ({
            goals: [...state.goals, newGoal]
          }));
          
          // Check for achievements
          await achievementService.checkGoalCreated(data.userId, newGoal);
          
          return newGoal;
        } catch (error) {
          console.error('Error creating goal:', error);
          set({ error: 'Failed to create goal' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateGoal: async (goalId: string, data: Partial<SavingsGoal>) => {
        try {
          set({ isLoading: true, error: null });
          await goalsRepository.update(goalId, data);
          set(state => ({
            goals: state.goals.map(goal =>
              goal.id === goalId ? { ...goal, ...data } : goal
            )
          }));
        } catch (error) {
          console.error('Error updating goal:', error);
          set({ error: 'Failed to update goal' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteGoal: async (goalId: string) => {
        try {
          set({ isLoading: true, error: null });
          await goalsRepository.deleteGoal(goalId);
          set(state => ({
            goals: state.goals.filter(goal => goal.id !== goalId)
          }));
        } catch (error) {
          console.error('Error deleting goal:', error);
          set({ error: 'Failed to delete goal' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      addContribution: async (goalId: string, amount: number, description?: string) => {
        try {
          set({ isLoading: true, error: null });
          const updatedGoal = await goalsRepository.addContribution(goalId, amount, description);
          set(state => ({
            goals: state.goals.map(goal =>
              goal.id === goalId ? updatedGoal : goal
            )
          }));
          
          // Check for achievements
          await achievementService.checkContribution(updatedGoal.userId, updatedGoal, amount);
          
        } catch (error) {
          console.error('Error adding contribution:', error);
          set({ error: 'Failed to add contribution' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      pauseGoal: async (goalId: string) => {
        try {
          set({ isLoading: true, error: null });
          await goalsRepository.pauseGoal(goalId);
          set(state => ({
            goals: state.goals.map(goal =>
              goal.id === goalId ? { ...goal, status: GoalStatus.PAUSED } : goal
            )
          }));
        } catch (error) {
          console.error('Error pausing goal:', error);
          set({ error: 'Failed to pause goal' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resumeGoal: async (goalId: string) => {
        try {
          set({ isLoading: true, error: null });
          await goalsRepository.resumeGoal(goalId);
          set(state => ({
            goals: state.goals.map(goal =>
              goal.id === goalId ? { ...goal, status: GoalStatus.ACTIVE } : goal
            )
          }));
        } catch (error) {
          console.error('Error resuming goal:', error);
          set({ error: 'Failed to resume goal' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Selectors
      getActiveGoals: () => {
        return get().goals.filter(goal => goal.status === GoalStatus.ACTIVE);
      },

      getCompletedGoals: () => {
        return get().goals.filter(goal => goal.status === GoalStatus.COMPLETED);
      },

      getPausedGoals: () => {
        return get().goals.filter(goal => goal.status === GoalStatus.PAUSED);
      },

      getGoalById: (id: string) => {
        return get().goals.find(goal => goal.id === id);
      },

      getTotalSavings: () => {
        return get().goals.reduce((total, goal) => total + goal.currentAmount, 0);
      },

      getGoalsByCategory: (category: GoalCategory) => {
        return get().goals.filter(goal => goal.category === category);
      },
    }),
    {
      name: 'goals-store',
    }
  )
);
