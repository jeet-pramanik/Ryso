import { create } from 'zustand';
import { Transaction, ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { transactionRepository } from '@/services/repositories/TransactionRepository';
import { seedOrchestrator } from '@/data/seedOrchestrator';
import { APP_CONFIG } from '@/constants/app';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  isHydrated: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  getTransactionsByCategory: (category: ExpenseCategory) => Transaction[];
  getTransactionsByMonth: (month: string) => Transaction[];
  hydrate: () => Promise<void>;
  getTotalSpentThisMonth: () => number;
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  isLoading: false,
  isHydrated: false,
  
  addTransaction: async (transactionData) => {
    try {
      const transaction: Transaction = {
        ...transactionData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      await transactionRepository.create(transaction);
      
      set((state) => ({
        transactions: [transaction, ...state.transactions]
      }));
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  },
  
  updateTransaction: async (id, updates) => {
    try {
      await transactionRepository.update(id, updates);
      
      set((state) => ({
        transactions: state.transactions.map(tx => 
          tx.id === id 
            ? { ...tx, ...updates }
            : tx
        )
      }));
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  },
  
  deleteTransaction: async (id) => {
    try {
      await transactionRepository.delete(id);
      
      set((state) => ({
        transactions: state.transactions.filter(tx => tx.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  },

  clearAllTransactions: async () => {
    try {
      // Clear from database
      await transactionRepository.clearAll();
      
      // Clear from state
      set({ transactions: [] });
    } catch (error) {
      console.error('Failed to clear transactions:', error);
      throw error;
    }
  },
  
  getTransactionsByCategory: (category) => {
    return get().transactions.filter(tx => tx.category === category);
  },
  
  getTransactionsByMonth: (month) => {
    return get().transactions.filter(tx => 
      tx.date.startsWith(month)
    );
  },
  
  getTotalSpentThisMonth: () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthTransactions = get().getTransactionsByMonth(currentMonth);
    return monthTransactions
      .filter(tx => tx.type === TransactionType.EXPENSE)
      .reduce((total, tx) => total + tx.amount, 0);
  },
  
  hydrate: async () => {
    try {
      set({ isLoading: true });
      
      // Ensure database is seeded
      await seedOrchestrator.checkAndSeed();
      
      // Load transactions from database
      const transactions = await transactionRepository.getByUserId(APP_CONFIG.DEMO_USER_ID);
      
      set({ 
        transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        isLoading: false,
        isHydrated: true
      });
    } catch (error) {
      console.error('Failed to hydrate transactions:', error);
      set({ isLoading: false });
      throw error;
    }
  }
}));