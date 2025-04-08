import { users, visionData, type User, type InsertUser, type VisionData, type InsertVisionData } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vision data methods
  createVisionData(data: InsertVisionData): Promise<VisionData>;
  getVisionDataByUserId(userId: number): Promise<VisionData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private visionDataStore: Map<number, VisionData>;
  private userIdToVisionIdMap: Map<number, number>;
  currentId: number;
  visionDataId: number;

  constructor() {
    this.users = new Map();
    this.visionDataStore = new Map();
    this.userIdToVisionIdMap = new Map();
    this.currentId = 1;
    this.visionDataId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createVisionData(insertData: InsertVisionData): Promise<VisionData> {
    const id = this.visionDataId++;
    // Ensure visionResults is defined, even if null
    const visionData = { 
      ...insertData, 
      id,
      visionResults: insertData.visionResults || null
    } as VisionData;
    this.visionDataStore.set(id, visionData);
    this.userIdToVisionIdMap.set(insertData.userId, id);
    return visionData;
  }
  
  async getVisionDataByUserId(userId: number): Promise<VisionData | undefined> {
    const visionId = this.userIdToVisionIdMap.get(userId);
    if (!visionId) return undefined;
    return this.visionDataStore.get(visionId);
  }
}

export const storage = new MemStorage();
