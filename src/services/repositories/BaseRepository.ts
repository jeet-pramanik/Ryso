import { Table } from 'dexie';

export abstract class BaseRepository<T, K = string> {
  constructor(protected table: Table<T, K>) {}

  async getAll(): Promise<T[]> {
    return await this.table.toArray();
  }

  async getById(id: K): Promise<T | undefined> {
    return await this.table.get(id);
  }

  async create(item: Omit<T, 'id'>): Promise<K> {
    return await this.table.add(item as T);
  }

  async update(id: K, updates: Partial<T>): Promise<number> {
    return await this.table.update(id, updates as any);
  }

  async delete(id: K): Promise<void> {
    await this.table.delete(id);
  }

  async clear(): Promise<void> {
    await this.table.clear();
  }

  async count(): Promise<number> {
    return await this.table.count();
  }
}
