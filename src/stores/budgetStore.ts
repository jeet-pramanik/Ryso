import { create } from 'zustand';
import { Budget, ExpenseCategory } from '@/types';
import { budgetRepository } from '@/services/repositories/BudgetRepository';
import { transactionRepository } from '@/services/repositories/TransactionRepository';
import { APP_CONFIG, BUDGET_CONFIG } from '@/constants/app';

interface BudgetStats {
  totalSpent: number;
  totalAllocated: number;
  percentage: number;
  remaining: number;
  daysRemaining: number;
  categoryBreakdown: {
    category: ExpenseCategory;
    allocated: number;
    spent: number;
    percentage: number;
    remaining: number;
  }[];
}

interface BudgetState {
  currentBudget: Budget | null;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  hydrate: () => Promise<void>;
  createBudget: (monthlyAmount: number, categoryAllocations?: Partial<Record<ExpenseCategory, number>>) => Promise<void>;
  updateCategoryAllocation: (category: ExpenseCategory, amount: number) => Promise<void>;
  recalculateBudget: () => Promise<void>;
  
  // Selectors
  getBudgetStats: () => BudgetStats;
  getBudgetAlert: () => { type: 'healthy' | 'warning' | 'critical'; message: string; percentage: number };
  getCategoryProgress: (category: ExpenseCategory) => { spent: number; allocated: number; percentage: number };
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  currentBudget: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      set({ isLoading: true });
      
      const budget = await budgetRepository.getCurrentMonthBudget(APP_CONFIG.DEMO_USER_ID);
      
      if (budget) {
        // Recalculate spending to ensure accuracy
        const currentMonth = new Date().toISOString().slice(0, 7);
        const categoryTotals = await transactionRepository.getCategoryTotals(APP_CONFIG.DEMO_USER_ID, currentMonth);
        
        await budgetRepository.recalculateSpending(budget.id, categoryTotals);
        
        // Fetch updated budget
        const updatedBudget = await budgetRepository.getById(budget.id);
        set({ currentBudget: updatedBudget || null });
      }
      
      set({ isLoading: false, isHydrated: true });
    } catch (error) {
      console.error('Failed to hydrate budget:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  createBudget: async (monthlyAmount, categoryAllocations) => {
    try {
      set({ isLoading: true });
      
      const budgetId = await budgetRepository.createMonthlyBudget(
        APP_CONFIG.DEMO_USER_ID,
        monthlyAmount,
        categoryAllocations
      );
      
      const newBudget = await budgetRepository.getById(budgetId);
      
      if (newBudget) {
        // Calculate current spending
        const currentMonth = new Date().toISOString().slice(0, 7);
        const categoryTotals = await transactionRepository.getCategoryTotals(APP_CONFIG.DEMO_USER_ID, currentMonth);
        
        await budgetRepository.recalculateSpending(budgetId, categoryTotals);
        
        const updatedBudget = await budgetRepository.getById(budgetId);
        set({ currentBudget: updatedBudget || null });
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to create budget:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateCategoryAllocation: async (category, amount) => {
    const { currentBudget } = get();
    if (!currentBudget) return;
    
    try {
      await budgetRepository.updateCategoryAllocation(currentBudget.id, category, amount);
      
      const updatedBudget = await budgetRepository.getById(currentBudget.id);
      set({ currentBudget: updatedBudget || null });
    } catch (error) {
      console.error('Failed to update category allocation:', error);
      throw error;
    }
  },

  recalculateBudget: async () => {
    const { currentBudget } = get();
    if (!currentBudget) return;
    
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const categoryTotals = await transactionRepository.getCategoryTotals(APP_CONFIG.DEMO_USER_ID, currentMonth);
      
      await budgetRepository.recalculateSpending(currentBudget.id, categoryTotals);
      
      const updatedBudget = await budgetRepository.getById(currentBudget.id);
      set({ currentBudget: updatedBudget || null });
    } catch (error) {
      console.error('Failed to recalculate budget:', error);
      throw error;
    }
  },

  getBudgetStats: () => {
    const { currentBudget } = get();
    if (!currentBudget) {
      return {
        totalSpent: 0,
        totalAllocated: 0,
        percentage: 0,
        remaining: 0,
        daysRemaining: 0,
        categoryBreakdown: []
      };
    }

    const totalAllocated = currentBudget.monthlyAmount;
    const totalSpent = currentBudget.currentSpent;
    const percentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const remaining = totalAllocated - totalSpent;

    // Calculate days remaining in month
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const categoryBreakdown = Object.entries(currentBudget.categories).map(([category, data]) => ({
      category: category as ExpenseCategory,
      allocated: data.allocated,
      spent: data.spent,
      percentage: data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0,
      remaining: data.allocated - data.spent
    }));

    return {
      totalSpent,
      totalAllocated,
      percentage,
      remaining,
      daysRemaining,
      categoryBreakdown
    };
  },

  getBudgetAlert: () => {
    const stats = get().getBudgetStats();
    
    if (stats.percentage <= BUDGET_CONFIG.ALERT_THRESHOLDS.HEALTHY) {
      return { type: 'healthy', message: 'You\'re on track!', percentage: stats.percentage };
    } else if (stats.percentage <= BUDGET_CONFIG.ALERT_THRESHOLDS.WARNING) {
      return { type: 'warning', message: 'Watch your spending', percentage: stats.percentage };
    } else {
      return { type: 'critical', message: 'Budget exceeded!', percentage: stats.percentage };
    }
  },

  getCategoryProgress: (category) => {
    const { currentBudget } = get();
    if (!currentBudget || !currentBudget.categories[category]) {
      return { spent: 0, allocated: 0, percentage: 0 };
    }

    const categoryData = currentBudget.categories[category];
    const percentage = categoryData.allocated > 0 ? (categoryData.spent / categoryData.allocated) * 100 : 0;

    return {
      spent: categoryData.spent,
      allocated: categoryData.allocated,
      percentage
    };
  }
}));
