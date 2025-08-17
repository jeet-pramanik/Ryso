import { BaseRepository } from './BaseRepository';
import { Budget, ExpenseCategory } from '@/types';
import { db } from '@/services/database';
import { DEFAULT_CATEGORY_BUDGETS } from '@/constants/categories';

export class BudgetRepository extends BaseRepository<Budget> {
  constructor() {
    super(db.budgets);
  }

  async getByUserId(userId: string): Promise<Budget[]> {
    return await this.table.where('userId').equals(userId).toArray();
  }

  async getActiveByUserId(userId: string): Promise<Budget[]> {
    return await this.table
      .where('userId')
      .equals(userId)
      .and(budget => budget.isActive)
      .toArray();
  }

  async getCurrentMonthBudget(userId: string): Promise<Budget | undefined> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return await this.table
      .where('userId')
      .equals(userId)
      .and(budget => budget.month === currentMonth && budget.isActive)
      .first();
  }

  async getBudgetByMonth(userId: string, month: string): Promise<Budget | undefined> {
    return await this.table
      .where('userId')
      .equals(userId)
      .and(budget => budget.month === month)
      .first();
  }

  async createMonthlyBudget(
    userId: string, 
    monthlyAmount: number, 
    categoryAllocations?: Partial<Record<ExpenseCategory, number>>
  ): Promise<string> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Deactivate any existing budget for this month
    const existingBudget = await this.getBudgetByMonth(userId, currentMonth);
    if (existingBudget) {
      await this.update(existingBudget.id, { isActive: false });
    }

    // Create category allocations
    const categories = {} as Budget['categories'];
    Object.values(ExpenseCategory).forEach(category => {
      categories[category] = {
        allocated: categoryAllocations?.[category] || DEFAULT_CATEGORY_BUDGETS[category],
        spent: 0
      };
    });

    const budget: Omit<Budget, 'id'> = {
      userId,
      monthlyAmount,
      currentSpent: 0,
      month: currentMonth,
      categories,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.create(budget);
  }

  async updateCategorySpent(
    budgetId: string, 
    category: ExpenseCategory, 
    amount: number
  ): Promise<number> {
    const budget = await this.getById(budgetId);
    if (!budget) throw new Error('Budget not found');

    const updatedCategories = { ...budget.categories };
    updatedCategories[category] = {
      ...updatedCategories[category],
      spent: updatedCategories[category].spent + amount
    };

    const newCurrentSpent = budget.currentSpent + amount;

    return await this.update(budgetId, {
      categories: updatedCategories,
      currentSpent: newCurrentSpent,
      updatedAt: new Date().toISOString()
    });
  }

  async updateCategoryAllocation(
    budgetId: string, 
    category: ExpenseCategory, 
    allocatedAmount: number
  ): Promise<number> {
    const budget = await this.getById(budgetId);
    if (!budget) throw new Error('Budget not found');

    const updatedCategories = { ...budget.categories };
    updatedCategories[category] = {
      ...updatedCategories[category],
      allocated: allocatedAmount
    };

    return await this.update(budgetId, {
      categories: updatedCategories,
      updatedAt: new Date().toISOString()
    });
  }

  async recalculateSpending(budgetId: string, categoryTotals: Record<ExpenseCategory, number>): Promise<number> {
    const budget = await this.getById(budgetId);
    if (!budget) throw new Error('Budget not found');

    const updatedCategories = { ...budget.categories };
    let totalSpent = 0;

    Object.entries(categoryTotals).forEach(([category, spent]) => {
      const cat = category as ExpenseCategory;
      updatedCategories[cat] = {
        ...updatedCategories[cat],
        spent
      };
      totalSpent += spent;
    });

    return await this.update(budgetId, {
      categories: updatedCategories,
      currentSpent: totalSpent,
      updatedAt: new Date().toISOString()
    });
  }
}

export const budgetRepository = new BudgetRepository();
