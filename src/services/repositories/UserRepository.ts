import { BaseRepository } from './BaseRepository';
import { User } from '@/types';
import { db } from '@/services/database';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(db.users);
  }

  async getByEmail(email: string): Promise<User | undefined> {
    return await this.table.where('email').equals(email).first();
  }

  async getByPhone(phone: string): Promise<User | undefined> {
    return await this.table.where('phone').equals(phone).first();
  }

  async updateBudget(userId: string, monthlyBudget: number): Promise<number> {
    return await this.update(userId, { 
      monthlyBudget, 
      updatedAt: new Date().toISOString() 
    });
  }
}

export const userRepository = new UserRepository();
