import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// neon() returns an HTTP-backed query function, so it must be paired with the
// neon-http driver. The neon-serverless driver expects a WebSocket Pool/Client
// and would fail every query with "client.query is not a function".
// HTTP also avoids holding a socket open, which is what we want per invocation
// on Vercel's serverless runtime.
const sql = neon(process.env.DATABASE_URL!);

// Create drizzle database instance
export const db = drizzle(sql);
