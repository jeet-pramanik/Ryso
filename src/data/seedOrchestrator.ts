import { db } from '@/services/database';
import { userRepository } from '@/services/repositories/UserRepository';
import { transactionRepository } from '@/services/repositories/TransactionRepository';
import { goalsRepository } from '@/services/repositories/GoalsRepository';
import { generateDemoTransactions, generateDemoGoals } from '@/services/demoData';
import { User } from '@/types';
import { APP_CONFIG } from '@/constants/app';

const SEED_VERSION_KEY = 'ampp_seed_version';
const CURRENT_SEED_VERSION = '1.0.0';

export class SeedOrchestrator {
  private static instance: SeedOrchestrator;
  private isSeeded = false;

  static getInstance(): SeedOrchestrator {
    if (!SeedOrchestrator.instance) {
      SeedOrchestrator.instance = new SeedOrchestrator();
    }
    return SeedOrchestrator.instance;
  }

  async checkAndSeed(): Promise<void> {
    if (this.isSeeded) return;

    try {
      // Check if database is already seeded with current version
      const existingUser = await userRepository.getById(APP_CONFIG.DEMO_USER_ID);
      const seedVersion = localStorage.getItem(SEED_VERSION_KEY);
      
      if (existingUser && seedVersion === CURRENT_SEED_VERSION) {
        this.isSeeded = true;
        return;
      }

      // Clear existing data if version mismatch
      if (existingUser && seedVersion !== CURRENT_SEED_VERSION) {
        await this.clearAllData();
      }

      await this.seedData();
      localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
      this.isSeeded = true;
    } catch (error) {
      console.error('Failed to seed database:', error);
      throw error;
    }
  }

  private async seedData(): Promise<void> {
    // Create demo user
    const demoUser: User = {
      id: APP_CONFIG.DEMO_USER_ID,
      name: 'Arjun Sharma',
      email: 'arjun.sharma@college.edu',
      phone: '+91 98765 43210',
      monthlyBudget: 8000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await userRepository.create(demoUser);

    // Generate and seed transactions
    const transactions = generateDemoTransactions(APP_CONFIG.DEMO_USER_ID);
    for (const transaction of transactions) {
      await transactionRepository.create(transaction);
    }

    // Generate and seed goals
    const goals = generateDemoGoals(APP_CONFIG.DEMO_USER_ID);
    for (const goal of goals) {
      await goalsRepository.create(goal);
    }

    console.log('Database seeded successfully with demo data');
  }

  private async clearAllData(): Promise<void> {
    await Promise.all([
      userRepository.clear(),
      transactionRepository.clear(),
      goalsRepository.clear()
    ]);
  }

  async reseed(): Promise<void> {
    await this.clearAllData();
    localStorage.removeItem(SEED_VERSION_KEY);
    this.isSeeded = false;
    await this.checkAndSeed();
  }
}

export const seedOrchestrator = SeedOrchestrator.getInstance();
