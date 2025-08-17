// AMPP FinTech App Types

export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  HOSTEL = 'HOSTEL',
  BOOKS = 'BOOKS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EMERGENCY = 'EMERGENCY'
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  SAVINGS = 'SAVINGS'
}

export enum PaymentMethod {
  UPI = 'UPI',
  CASH = 'CASH',
  CARD = 'CARD'
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

export enum GoalCategory {
  EMERGENCY = 'EMERGENCY',
  CAREER = 'CAREER',
  TRAVEL = 'TRAVEL',
  GADGET = 'GADGET',
  OTHER = 'OTHER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  monthlyBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  merchantName?: string;
  upiTransactionId?: string;
  userId: string;
  createdAt: string;
  // Categorization metadata
  categoryConfidence?: number;
  isManualCategory?: boolean;
  categorizationReason?: string;
}

export interface Budget {
  id: string;
  userId: string;
  monthlyAmount: number;
  currentSpent: number;
  month: string; // YYYY-MM format
  categories: {
    [key in ExpenseCategory]: {
      allocated: number;
      spent: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  amount: number;
  date: string;
  isCompleted: boolean;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: GoalCategory;
  status: GoalStatus;
  icon: string;
  color: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  type: 'BUDGET' | 'SAVINGS' | 'SPENDING' | 'GOAL';
}

export interface AppSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    hideSensitiveInfo: boolean;
    requireAuth: boolean;
  };
  updatedAt: string;
}

export interface BudgetAlert {
  type: 'healthy' | 'warning' | 'critical';
  message: string;
  percentage: number;
}

export interface PaymentRequest {
  recipientUPI: string;
  amount: number;
  description: string;
  category?: ExpenseCategory;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  timestamp: string;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  suggestedDuration: number; // days
  category: GoalCategory;
  icon: string;
  color: string;
}

export interface DashboardStats {
  totalSpent: number;
  budgetRemaining: number;
  daysRemaining: number;
  savingsGoalsActive: number;
  monthlyProgress: number;
  categoryBreakdown: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
}