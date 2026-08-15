import {
  users, visionData, sharedVisions, visionComments, visionLikes, companyResearch,
  type User, type InsertUser,
  type VisionData, type InsertVisionData,
  type SharedVision, type InsertSharedVision,
  type VisionComment, type InsertVisionComment,
  type VisionLike, type InsertVisionLike,
  type CompanyResearch, type InsertCompanyResearch,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, isNull } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vision data methods
  createVisionData(data: InsertVisionData): Promise<VisionData>;
  getVisionDataByUserId(userId: number): Promise<VisionData | undefined>;
  updateVisionPublicStatus(id: number, isPublic: boolean): Promise<VisionData>;
  
  // Shared vision methods
  createSharedVision(data: InsertSharedVision): Promise<SharedVision>;
  getSharedVisions(limit?: number, offset?: number): Promise<SharedVision[]>;
  getSharedVisionById(id: number): Promise<SharedVision | undefined>;
  getSharedVisionsByUserId(userId: number): Promise<SharedVision[]>;
  incrementSharedVisionViews(id: number): Promise<void>;
  
  // Comment methods
  createVisionComment(data: InsertVisionComment): Promise<VisionComment>;
  getVisionCommentsBySharedVisionId(sharedVisionId: number): Promise<VisionComment[]>;
  
  // Like methods
  createVisionLike(data: InsertVisionLike): Promise<VisionLike>;
  deleteVisionLike(sharedVisionId: number, userId: number): Promise<void>;
  hasUserLikedVision(sharedVisionId: number, userId: number): Promise<boolean>;
  updateSharedVisionLikeCount(sharedVisionId: number): Promise<void>;

  // Company research methods
  createCompanyResearch(data: InsertCompanyResearch): Promise<CompanyResearch>;
  getCompanyResearchList(): Promise<CompanyResearch[]>;
  getCompanyResearchById(id: number): Promise<CompanyResearch | undefined>;
  deleteCompanyResearch(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
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
  
  // Vision data methods
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
  
  async updateVisionPublicStatus(id: number, isPublic: boolean): Promise<VisionData> {
    const [result] = await db
      .update(visionData)
      .set({ isPublic })
      .where(eq(visionData.id, id))
      .returning();
    return result;
  }
  
  // Shared vision methods
  async createSharedVision(data: InsertSharedVision): Promise<SharedVision> {
    const [result] = await db
      .insert(sharedVisions)
      .values(data)
      .returning();
    return result;
  }
  
  async getSharedVisions(limit: number = 20, offset: number = 0): Promise<SharedVision[]> {
    return db
      .select()
      .from(sharedVisions)
      .orderBy(desc(sharedVisions.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getSharedVisionById(id: number): Promise<SharedVision | undefined> {
    const [result] = await db
      .select()
      .from(sharedVisions)
      .where(eq(sharedVisions.id, id));
    return result || undefined;
  }
  
  async getSharedVisionsByUserId(userId: number): Promise<SharedVision[]> {
    return db
      .select()
      .from(sharedVisions)
      .where(eq(sharedVisions.userId, userId))
      .orderBy(desc(sharedVisions.createdAt));
  }
  
  async incrementSharedVisionViews(id: number): Promise<void> {
    await db
      .update(sharedVisions)
      .set({ views: sql`${sharedVisions.views} + 1` })
      .where(eq(sharedVisions.id, id));
  }
  
  // Comment methods
  async createVisionComment(data: InsertVisionComment): Promise<VisionComment> {
    const [result] = await db
      .insert(visionComments)
      .values(data)
      .returning();
    return result;
  }
  
  async getVisionCommentsBySharedVisionId(sharedVisionId: number): Promise<VisionComment[]> {
    return db
      .select()
      .from(visionComments)
      .where(eq(visionComments.sharedVisionId, sharedVisionId))
      .orderBy(desc(visionComments.createdAt));
  }
  
  // Like methods
  async createVisionLike(data: InsertVisionLike): Promise<VisionLike> {
    const [result] = await db
      .insert(visionLikes)
      .values(data)
      .returning();
    
    // Update like count in shared vision table
    await this.updateSharedVisionLikeCount(data.sharedVisionId);
    
    return result;
  }
  
  async deleteVisionLike(sharedVisionId: number, userId: number): Promise<void> {
    await db
      .delete(visionLikes)
      .where(
        and(
          eq(visionLikes.sharedVisionId, sharedVisionId),
          eq(visionLikes.userId, userId)
        )
      );
    
    // Update like count in shared vision table
    await this.updateSharedVisionLikeCount(sharedVisionId);
  }
  
  async hasUserLikedVision(sharedVisionId: number, userId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(visionLikes)
      .where(
        and(
          eq(visionLikes.sharedVisionId, sharedVisionId),
          eq(visionLikes.userId, userId)
        )
      );
    return !!result;
  }
  
  async updateSharedVisionLikeCount(sharedVisionId: number): Promise<void> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(visionLikes)
      .where(eq(visionLikes.sharedVisionId, sharedVisionId));
    const likeCount = parseInt(String(result[0].count), 10);
    await db
      .update(sharedVisions)
      .set({ likes: likeCount })
      .where(eq(sharedVisions.id, sharedVisionId));
  }

  // Company research methods
  async createCompanyResearch(data: InsertCompanyResearch): Promise<CompanyResearch> {
    const [result] = await db.insert(companyResearch).values(data).returning();
    return result;
  }

  async getCompanyResearchList(): Promise<CompanyResearch[]> {
    return db.select().from(companyResearch).orderBy(desc(companyResearch.createdAt));
  }

  async getCompanyResearchById(id: number): Promise<CompanyResearch | undefined> {
    const [result] = await db.select().from(companyResearch).where(eq(companyResearch.id, id));
    return result || undefined;
  }

  async deleteCompanyResearch(id: number): Promise<void> {
    await db.delete(companyResearch).where(eq(companyResearch.id, id));
  }
}

// Create an instance of the DatabaseStorage
export const storage = new DatabaseStorage();
