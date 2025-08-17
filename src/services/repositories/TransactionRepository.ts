import { BaseRepository } from './BaseRepository';
import { Transaction, ExpenseCategory, TransactionType } from '@/types';
import { db } from '@/services/database';

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

  async clearAll(): Promise<void> {
    await this.table.clear();
  }
}

export const transactionRepository = new TransactionRepository();
