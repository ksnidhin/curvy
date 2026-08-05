import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

export class JsonDatabase<T extends { id: string }> {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
  }

  async read(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }

  async write(data: T[]): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing ${this.filePath}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    return this.read();
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.read();
    return items.find(item => item.id === id) || null;
  }

  async create(data: Omit<T, 'id'> | T): Promise<T> {
    const items = await this.read();
    const newItem = { ...data, id: (data as any).id || crypto.randomUUID() } as T;
    
    // Check if ID already exists (in case it was provided)
    const existingIndex = items.findIndex(item => item.id === newItem.id);
    if (existingIndex >= 0) {
      items[existingIndex] = newItem;
    } else {
      items.push(newItem);
    }
    
    await this.write(items);
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const items = await this.read();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    items[index] = { ...items[index], ...data };
    await this.write(items);
    return items[index];
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.read();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length === items.length) {
      return false; // Nothing deleted
    }
    
    await this.write(filtered);
    return true;
  }
}
