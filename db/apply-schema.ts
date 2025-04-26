import { db, pool } from "./index";
import { notifications } from "../shared/schema";
import { sql } from "drizzle-orm";

async function applySchema() {
  try {
    console.log("Creating notifications table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        related_id INTEGER,
        related_type TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Notifications table created successfully.");
    
    // Close the connection pool
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error("Error applying schema:", error);
    process.exit(1);
  }
}

applySchema();