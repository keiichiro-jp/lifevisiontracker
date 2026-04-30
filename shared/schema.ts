import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visionData = pgTable("vision_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  basicInfo: jsonb("basic_info").notNull(), // age, gender, family status, etc.
  questionnaire: jsonb("questionnaire").notNull(), // interests, challenges, etc.
  aiQuestions: jsonb("ai_questions").notNull(), // AI follow-up questions and answers
  visionResults: jsonb("vision_results"), // The final vision results
  keyMessage: text("key_message"),
  isPublic: boolean("is_public").default(false),
  createdAt: text("created_at").notNull(), // ISO date string
});

export const sharedVisions = pgTable("shared_visions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  visionId: integer("vision_id").notNull(),
  title: text("title").notNull(),
  keyMessage: text("key_message").notNull(),
  visionSummary: jsonb("vision_summary").notNull(), // Simplified version of visionResults
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visionComments = pgTable("vision_comments", {
  id: serial("id").primaryKey(),
  sharedVisionId: integer("shared_vision_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visionLikes = pgTable("vision_likes", {
  id: serial("id").primaryKey(),
  sharedVisionId: integer("shared_vision_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companyResearch = pgTable("company_research", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  organizationStructure: jsonb("organization_structure").notNull(),
  businessActivities: jsonb("business_activities").notNull(),
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

// Types
export type BasicInfo = {
  ageRange: string;
  gender: string;
  familyStatus: string;
  occupation: string;
  location: string;
};

export type QuestionnaireData = {
  interests: string[];
  challenges: string[];
  otherInterests?: string;
  otherChallenges?: string;
};

export type AIQuestion = {
  id: string;
  question: string;
  options?: string[];
  selectionType: 'single' | 'multiple' | 'text';
  answer?: string | string[];
};

export type VisionResult = {
  category: string;
  title: string;
  color: string;
  content: string;
};

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertVisionDataSchema = createInsertSchema(visionData).pick({
  userId: true,
  basicInfo: true,
  questionnaire: true,
  aiQuestions: true,
  visionResults: true,
  createdAt: true,
});

// Define more specific validation schemas for frontend use
export const basicInfoSchema = z.object({
  ageRange: z.string().min(1, "Age range is required"),
  gender: z.string().min(1, "Gender is required"),
  familyStatus: z.string().min(1, "Family status is required"),
  occupation: z.string().min(1, "Occupation is required"),
  location: z.string().min(1, "Location is required"),
});

export const questionnaireSchema = z.object({
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  challenges: z.array(z.string()).min(1, "Select at least one challenge"),
  otherInterests: z.string().optional(),
  otherChallenges: z.string().optional(),
});

export const aiQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  selectionType: z.enum(['single', 'multiple', 'text']),
  answer: z.union([z.string(), z.array(z.string())]).optional(),
});

export const visionResultSchema = z.object({
  category: z.string(),
  title: z.string(),
  color: z.string(),
  content: z.string(),
});

// Community schemas
export const sharedVisionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  keyMessage: z.string().min(5, "Key message is required"),
  visionSummary: z.array(visionResultSchema).min(1, "At least one vision is required"),
});

export const visionCommentSchema = z.object({
  content: z.string().min(3, "Comment must be at least 3 characters"),
});

// Insert schemas for new tables
export const insertSharedVisionSchema = createInsertSchema(sharedVisions).pick({
  userId: true,
  visionId: true,
  title: true,
  keyMessage: true,
  visionSummary: true,
});

export const insertVisionCommentSchema = createInsertSchema(visionComments).pick({
  sharedVisionId: true,
  userId: true,
  content: true,
});

export const insertVisionLikeSchema = createInsertSchema(visionLikes).pick({
  sharedVisionId: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVisionData = z.infer<typeof insertVisionDataSchema>;
export type VisionData = typeof visionData.$inferSelect;
export type InsertSharedVision = z.infer<typeof insertSharedVisionSchema>;
export type SharedVision = typeof sharedVisions.$inferSelect;
export type InsertVisionComment = z.infer<typeof insertVisionCommentSchema>;
export type VisionComment = typeof visionComments.$inferSelect;
export type InsertVisionLike = z.infer<typeof insertVisionLikeSchema>;
export type VisionLike = typeof visionLikes.$inferSelect;
