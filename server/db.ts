import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

// Create neon client
const sql = neon(process.env.DATABASE_URL!);

// Create drizzle database instance
export const db = drizzle(sql);