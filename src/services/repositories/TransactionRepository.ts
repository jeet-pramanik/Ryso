import { BaseRepository } from './BaseRepository';
import { Transaction, ExpenseCategory, TransactionType } from '@/types';
import { db } from '@/services/database';
import { categorizationService, CategorizationResult } from '@/services/categorization';

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super(db.transactions);
  }

  async getByUserId(userId: string): Promise<Transaction[]> {
    return await this.table.where('userId').equals(userId).toArray();
  }

  async getByCategory(category: ExpenseCategory): Promise<Transaction[]> {
    return await this.table.where('category').equals(category).toArray();
  }

  async getByType(type: TransactionType): Promise<Transaction[]> {
    return await this.table.where('type').equals(type).toArray();
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return await this.table
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getByUserAndMonth(userId: string, month: string): Promise<Transaction[]> {
    return await this.table
      .where('userId')
      .equals(userId)
      .and(tx => tx.date.startsWith(month))
      .toArray();
  }

  async getTotalSpentByUserAndMonth(userId: string, month: string): Promise<number> {
    const transactions = await this.getByUserAndMonth(userId, month);
    return transactions
      .filter(tx => tx.type === TransactionType.EXPENSE)
      .reduce((total, tx) => total + tx.amount, 0);
  }

  async getCategoryTotals(userId: string, month: string): Promise<Record<ExpenseCategory, number>> {
    const transactions = await this.getByUserAndMonth(userId, month);
    const expenses = transactions.filter(tx => tx.type === TransactionType.EXPENSE);
    
    const totals = {} as Record<ExpenseCategory, number>;
    Object.values(ExpenseCategory).forEach(category => {
      totals[category] = expenses
        .filter(tx => tx.category === category)
        .reduce((total, tx) => total + tx.amount, 0);
    });
    
    return totals;
  }

  /**
   * Create a transaction with automatic categorization
   */
  async createWithCategorization(
    transactionData: Omit<Transaction, 'id' | 'category' | 'categoryConfidence' | 'isManualCategory' | 'categorizationReason'>
  ): Promise<Transaction> {
    const categorization = categorizationService.categorize(
      transactionData.description,
      transactionData.merchantName,
      transactionData.upiTransactionId
    );

    const transaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      category: categorization.category,
      categoryConfidence: categorization.confidence,
      isManualCategory: false,
      categorizationReason: categorization.reason
    };

    await this.create(transaction);
    return transaction;
  }

  /**
   * Update transaction category manually
   */
  async updateCategoryManually(
    transactionId: string,
    category: ExpenseCategory,
    reason?: string
  ): Promise<void> {
    await this.update(transactionId, {
      category,
      isManualCategory: true,
      categoryConfidence: 1.0,
      categorizationReason: reason || 'Manual categorization'
    });
  }

  /**
   * Re-categorize all non-manual transactions for a user
   */
  async recategorizeUserTransactions(userId: string): Promise<{
    processed: number;
    updated: number;
  }> {
    const transactions = await this.getByUserId(userId);
    const nonManualTransactions = transactions.filter(tx => !tx.isManualCategory);
    
    let updatedCount = 0;
    
    for (const transaction of nonManualTransactions) {
      const categorization = categorizationService.categorize(
        transaction.description,
        transaction.merchantName,
        transaction.upiTransactionId
      );

      // Only update if category changed or confidence improved significantly
      if (
        transaction.category !== categorization.category ||
        (transaction.categoryConfidence || 0) < categorization.confidence - 0.1
      ) {
        await this.update(transaction.id, {
          category: categorization.category,
          categoryConfidence: categorization.confidence,
          categorizationReason: categorization.reason
        });
        updatedCount++;
      }
    }

    return {
      processed: nonManualTransactions.length,
      updated: updatedCount
    };
  }

  /**
   * Get categorization statistics for debugging
   */
  async getCategorizationStats(userId: string): Promise<{
    total: number;
    manual: number;
    automatic: number;
    lowConfidence: number;
    averageConfidence: number;
    categoryBreakdown: Record<ExpenseCategory, { count: number; avgConfidence: number }>;
  }> {
    const transactions = await this.getByUserId(userId);
    const expenses = transactions.filter(tx => tx.type === TransactionType.EXPENSE);
    
    const manual = expenses.filter(tx => tx.isManualCategory).length;
    const automatic = expenses.length - manual;
    const lowConfidence = expenses.filter(tx => 
      !tx.isManualCategory && (tx.categoryConfidence || 0) < 0.6
    ).length;
    
    const totalConfidence = expenses.reduce((sum, tx) => 
      sum + (tx.categoryConfidence || 0), 0
    );
    const averageConfidence = expenses.length > 0 ? totalConfidence / expenses.length : 0;

    const categoryBreakdown = {} as Record<ExpenseCategory, { count: number; avgConfidence: number }>;
    Object.values(ExpenseCategory).forEach(category => {
      const categoryTransactions = expenses.filter(tx => tx.category === category);
      const avgConfidence = categoryTransactions.length > 0
        ? categoryTransactions.reduce((sum, tx) => sum + (tx.categoryConfidence || 0), 0) / categoryTransactions.length
        : 0;
      
      categoryBreakdown[category] = {
        count: categoryTransactions.length,
        avgConfidence
      };
    });

    return {
      total: expenses.length,
      manual,
      automatic,
      lowConfidence,
      averageConfidence,
      categoryBreakdown
    };
  }

  async clearAll(): Promise<void> {
    await this.table.clear();
  }
}

export const transactionRepository = new TransactionRepository();
