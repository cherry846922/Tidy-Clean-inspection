import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users (original table)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Properties
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  type: text("type").notNull(),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: real("bathrooms").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertiesRelations = relations(properties, ({ many }) => ({
  inspections: many(inspections),
}));

export const insertPropertySchema = createInsertSchema(properties, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  address: (schema) => schema.min(5, "Address must be at least 5 characters"),
  type: (schema) => schema.min(1, "Type is required"),
  bedrooms: (schema) => schema.int().positive("Must be a positive number"),
  bathrooms: (schema) => schema.positive("Must be a positive number"),
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Cleaners
export const cleaners = pgTable("cleaners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cleanersRelations = relations(cleaners, ({ many }) => ({
  inspections: many(inspections),
}));

export const insertCleanerSchema = createInsertSchema(cleaners, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must be a valid email"),
  phone: (schema) => schema.optional(),
});

export type InsertCleaner = z.infer<typeof insertCleanerSchema>;
export type Cleaner = typeof cleaners.$inferSelect;

// Inspections
export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  cleanerId: integer("cleaner_id").references(() => cleaners.id).notNull(),
  date: timestamp("date").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  price: real("price").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, processing, paid
  paymentId: text("payment_id"), // Stripe payment intent ID
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  issues: text("issues"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  property: one(properties, {
    fields: [inspections.propertyId],
    references: [properties.id],
  }),
  cleaner: one(cleaners, {
    fields: [inspections.cleanerId],
    references: [cleaners.id],
  }),
}));

export const insertInspectionSchema = createInsertSchema(inspections, {
  date: (schema) => schema,
  durationMinutes: (schema) => schema.positive("Duration must be positive"),
  status: (schema) => schema.refine(val => ["scheduled", "completed", "cancelled"].includes(val), {
    message: "Status must be 'scheduled', 'completed', or 'cancelled'"
  }),
});

export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect & {
  property: Property;
  cleaner: Cleaner;
};

// UpdateInspectionStatusSchema
export const updateInspectionStatusSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled"]),
  issues: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export type UpdateInspectionStatus = z.infer<typeof updateInspectionStatusSchema>;

// Payment related schemas
export const createPaymentIntentSchema = z.object({
  inspectionId: z.number().positive(),
  amount: z.number().positive(),
});

export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;

export const updatePaymentStatusSchema = z.object({
  inspectionId: z.number().positive(),
  paymentStatus: z.enum(["unpaid", "processing", "paid"]),
  paymentId: z.string().optional(),
});

export type UpdatePaymentStatus = z.infer<typeof updatePaymentStatusSchema>;
