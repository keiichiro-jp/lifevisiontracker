import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
});

export const visionData = pgTable("vision_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  basicInfo: jsonb("basic_info").notNull(), // age, gender, family status, etc.
  questionnaire: jsonb("questionnaire").notNull(), // interests, challenges, etc.
  aiQuestions: jsonb("ai_questions").notNull(), // AI follow-up questions and answers
  visionResults: jsonb("vision_results"), // The final vision results
  createdAt: text("created_at").notNull(), // ISO date string
});

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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVisionData = z.infer<typeof insertVisionDataSchema>;
export type VisionData = typeof visionData.$inferSelect;
