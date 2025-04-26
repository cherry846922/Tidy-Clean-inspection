import { db, pool } from "./index";
import { notifications, notificationPreferences } from "../shared/schema";
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
    
    console.log("Creating notification_preferences table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        inspection_reminders BOOLEAN NOT NULL DEFAULT TRUE,
        payment_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        report_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        property_updates BOOLEAN NOT NULL DEFAULT TRUE,
        marketing_notifications BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `);

    console.log("Notification preferences table created successfully.");
    
    // Close the connection pool
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error("Error applying schema:", error);
    process.exit(1);
  }
}

applySchema();