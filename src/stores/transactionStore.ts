import { create } from 'zustand';
import { Transaction, ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { generateDemoTransactions } from '@/services/demoData';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByCategory: (category: ExpenseCategory) => Transaction[];
  getTransactionsByMonth: (month: string) => Transaction[];
  loadDemoTransactions: () => void;
  getTotalSpentThisMonth: () => number;
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  isLoading: false,
  
  addTransaction: (transactionData) => {
    const transaction: Transaction = {
      ...transactionData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      transactions: [transaction, ...state.transactions]
    }));
  },
  
  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map(tx => 
        tx.id === id 
          ? { ...tx, ...updates }
          : tx
      )
    }));
  },
  
  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter(tx => tx.id !== id)
    }));
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
  
  loadDemoTransactions: () => {
    set({ isLoading: true });
    setTimeout(() => {
      const demoTransactions = generateDemoTransactions('demo-user-1');
      set({ 
        transactions: demoTransactions,
        isLoading: false 
      });
    }, 500);
  }
}));