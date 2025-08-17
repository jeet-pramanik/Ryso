import Dexie, { Table } from 'dexie';
import { 
  User, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  Achievement, 
  AppSettings 
} from '@/types';

export class AMPPDatabase extends Dexie {
  users!: Table<User>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  goals!: Table<SavingsGoal>;
  achievements!: Table<Achievement>;
  settings!: Table<AppSettings>;

  constructor() {
    super('AMPP_Database');
    
    this.version(1).stores({
      users: '++id, email, phone',
      transactions: '++id, userId, date, category, type, amount',
      budgets: '++id, userId, month',
      goals: '++id, userId, status, targetDate',
      achievements: '++id, userId, type, unlockedAt',
      settings: '++id, userId'
    });
  }
}

export const db = new AMPPDatabase();