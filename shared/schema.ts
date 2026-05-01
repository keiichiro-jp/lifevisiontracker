import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";

export const companyResearch = pgTable("company_research", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  industryTag: text("industry_tag"),
  organizationStructure: jsonb("organization_structure").notNull(),
  businessActivities: jsonb("business_activities").notNull(),
  aiAgentSuggestions: jsonb("ai_agent_suggestions"),
  competitors: jsonb("competitors").notNull(),
  summary: text("summary"),
  sources: jsonb("sources").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CompanyResearchRecord = typeof companyResearch.$inferSelect;
export type InsertCompanyResearch = typeof companyResearch.$inferInsert;

export type Department = {
  name: string;
  description: string;
  subDepartments?: Department[];
  roles?: string[];
};

export type BusinessActivity = {
  name: string;
  department: string;
  description: string;
  sourceUrl?: string;
  sourceType: "official_site" | "job_posting" | "ir_document" | "press_release" | "linkedin" | "news" | "other";
};

export type Competitor = {
  name: string;
  reason: string;
  industry: string;
};

export type AIAgentSuggestion = {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  department: string;
};

export type Source = {
  type: string;
  description: string;
  url: string;
};
