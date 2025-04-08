import { users, visionData, type User, type InsertUser, type VisionData, type InsertVisionData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async createVisionData(data: InsertVisionData): Promise<VisionData> {
    const [result] = await db
      .insert(visionData)
      .values(data)
      .returning();
    return result;
  }

  async getVisionDataByUserId(userId: number): Promise<VisionData | undefined> {
    const [result] = await db
      .select()
      .from(visionData)
      .where(eq(visionData.userId, userId));
    return result || undefined;
  }
}

// Create an instance of the DatabaseStorage
export const storage = new DatabaseStorage();
