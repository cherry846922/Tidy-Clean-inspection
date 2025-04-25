import { pgTable, text, serial, integer, boolean, timestamp, real, primaryKey, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("host"), // host or inspector
  email: text("email"),
  name: text("name"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  role: (schema) => schema.refine(val => ["host", "inspector"].includes(val), {
    message: "Role must be either 'host' or 'inspector'"
  }),
}).pick({
  username: true,
  password: true,
  role: true,
  email: true,
  name: true,
  phone: true,
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
  requestedBy: integer("requested_by").references(() => users.id), // Host who requested the inspection
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

export const inspectionsRelations = relations(inspections, ({ one, many }) => ({
  property: one(properties, {
    fields: [inspections.propertyId],
    references: [properties.id],
  }),
  cleaner: one(cleaners, {
    fields: [inspections.cleanerId],
    references: [cleaners.id],
  }),
  requestingUser: one(users, {
    fields: [inspections.requestedBy],
    references: [users.id],
  }),
  addons: many(inspectionAddons),
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
  addons?: (InspectionAddon & { addon: Addon })[];
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
  inspectionId: z.number({
    required_error: "Inspection ID is required",
    invalid_type_error: "Inspection ID must be a number"
  }).positive(),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }).positive(),
});

export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["unpaid", "processing", "paid", "failed"]),
  paymentId: z.string().optional(),
});

export type UpdatePaymentStatus = z.infer<typeof updatePaymentStatusSchema>;

// Add-ons (items like lightbulbs, batteries that can be added to inspections)
export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddonSchema = createInsertSchema(addons, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  price: (schema) => schema.refine(val => parseFloat(val) > 0, {
    message: "Price must be positive"
  }),
});

export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;

// Junction table for inspections and add-ons (many-to-many)
export const inspectionAddons = pgTable("inspection_addons", {
  inspectionId: integer("inspection_id").references(() => inspections.id).notNull(),
  addonId: integer("addon_id").references(() => addons.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.inspectionId, table.addonId] }),
  };
});

export const inspectionAddonsRelations = relations(inspectionAddons, ({ one }) => ({
  inspection: one(inspections, {
    fields: [inspectionAddons.inspectionId],
    references: [inspections.id],
  }),
  addon: one(addons, {
    fields: [inspectionAddons.addonId],
    references: [addons.id],
  }),
}));

export const insertInspectionAddonSchema = createInsertSchema(inspectionAddons, {
  quantity: (schema) => schema.int().positive("Quantity must be positive"),
});

export type InsertInspectionAddon = z.infer<typeof insertInspectionAddonSchema>;
export type InspectionAddon = typeof inspectionAddons.$inferSelect;
