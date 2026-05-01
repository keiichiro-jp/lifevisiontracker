import { companyResearch, type CompanyResearchRecord, type InsertCompanyResearch } from "@shared/schema";
import { db as _db, isDatabaseAvailable } from "./db";
import { eq, desc } from "drizzle-orm";

const db = _db!;

export interface IStorage {
  createCompanyResearch(data: InsertCompanyResearch): Promise<CompanyResearchRecord>;
  getCompanyResearchHistory(limit?: number): Promise<CompanyResearchRecord[]>;
  getCompanyResearchById(id: number): Promise<CompanyResearchRecord | undefined>;
  deleteCompanyResearch(id: number): Promise<void>;
}

class DatabaseStorage implements IStorage {
  async createCompanyResearch(data: InsertCompanyResearch): Promise<CompanyResearchRecord> {
    const [result] = await db.insert(companyResearch).values(data).returning();
    return result;
  }

  async getCompanyResearchHistory(limit = 20): Promise<CompanyResearchRecord[]> {
    return db.select().from(companyResearch).orderBy(desc(companyResearch.createdAt)).limit(limit);
  }

  async getCompanyResearchById(id: number): Promise<CompanyResearchRecord | undefined> {
    const [result] = await db.select().from(companyResearch).where(eq(companyResearch.id, id));
    return result || undefined;
  }

  async deleteCompanyResearch(id: number): Promise<void> {
    await db.delete(companyResearch).where(eq(companyResearch.id, id));
  }
}

class MemoryStorage implements IStorage {
  private researches: CompanyResearchRecord[] = [];
  private nextId = 1;

  async createCompanyResearch(data: InsertCompanyResearch): Promise<CompanyResearchRecord> {
    const rec: CompanyResearchRecord = {
      id: this.nextId++,
      industryTag: null,
      aiAgentSuggestions: null,
      summary: null,
      createdAt: new Date(),
      ...data,
    } as CompanyResearchRecord;
    this.researches.unshift(rec);
    return rec;
  }

  async getCompanyResearchHistory(limit = 20): Promise<CompanyResearchRecord[]> {
    return this.researches.slice(0, limit);
  }

  async getCompanyResearchById(id: number): Promise<CompanyResearchRecord | undefined> {
    return this.researches.find(r => r.id === id);
  }

  async deleteCompanyResearch(id: number): Promise<void> {
    this.researches = this.researches.filter(r => r.id !== id);
  }
}

export const storage: IStorage = isDatabaseAvailable ? new DatabaseStorage() : new MemoryStorage();
