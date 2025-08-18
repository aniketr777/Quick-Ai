import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL; // 👈 matches .env
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

export const sql = neon(connectionString);
