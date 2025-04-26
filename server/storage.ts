import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, gte, lte, or } from "drizzle-orm";

// Property operations
export const storage = {
  // Users
  async getUserByUsername(username: string) {
    return db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
  },
  
  async getUser(id: number) {
    return db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
  },
  
  async updateUser(id: number, userData: Partial<schema.InsertUser>) {
    const [updatedUser] = await db.update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  },
  // Properties
  async getAllProperties() {
    return db.query.properties.findMany({
      orderBy: [desc(schema.properties.createdAt)]
    });
  },
  
  async getPropertyById(id: number) {
    return db.query.properties.findFirst({
      where: eq(schema.properties.id, id)
    });
  },
  
  async insertProperty(property: schema.InsertProperty) {
    const [newProperty] = await db.insert(schema.properties)
      .values(property)
      .returning();
    return newProperty;
  },
  
  async updateProperty(id: number, property: Partial<schema.InsertProperty>) {
    const [updatedProperty] = await db.update(schema.properties)
      .set(property)
      .where(eq(schema.properties.id, id))
      .returning();
    return updatedProperty;
  },
  
  async updatePropertyHealthScore(id: number, score: number) {
    const [updatedProperty] = await db.update(schema.properties)
      .set({
        healthScore: score,
        lastHealthCheck: new Date()
      })
      .where(eq(schema.properties.id, id))
      .returning();
    return updatedProperty;
  },
  
  async getPropertyHealthScore(id: number) {
    const property = await db.query.properties.findFirst({
      where: eq(schema.properties.id, id),
      columns: {
        id: true,
        healthScore: true,
        lastHealthCheck: true
      }
    });
    return property;
  },
  
  // Cleaners
  async getAllCleaners() {
    return db.query.cleaners.findMany({
      where: eq(schema.cleaners.isActive, true),
      orderBy: [desc(schema.cleaners.createdAt)]
    });
  },
  
  async getCleanerById(id: number) {
    return db.query.cleaners.findFirst({
      where: eq(schema.cleaners.id, id)
    });
  },
  
  async insertCleaner(cleaner: schema.InsertCleaner) {
    const [newCleaner] = await db.insert(schema.cleaners)
      .values(cleaner)
      .returning();
    return newCleaner;
  },
  
  // Inspections
  async getAllInspections(filters?: {
    propertyId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = db.query.inspections.findMany({
      with: {
        property: true,
        cleaner: true
      },
      orderBy: [desc(schema.inspections.date)]
    });
    
    // Apply filters if provided
    if (filters) {
      const conditions = [];
      
      if (filters.propertyId) {
        conditions.push(eq(schema.inspections.propertyId, filters.propertyId));
      }
      
      if (filters.status) {
        conditions.push(eq(schema.inspections.status, filters.status));
      }
      
      if (filters.startDate && filters.endDate) {
        conditions.push(and(
          gte(schema.inspections.date, filters.startDate),
          lte(schema.inspections.date, filters.endDate)
        ));
      } else if (filters.startDate) {
        conditions.push(gte(schema.inspections.date, filters.startDate));
      } else if (filters.endDate) {
        conditions.push(lte(schema.inspections.date, filters.endDate));
      }
      
      if (conditions.length > 0) {
        query = db.query.inspections.findMany({
          where: and(...conditions),
          with: {
            property: true,
            cleaner: true
          },
          orderBy: [desc(schema.inspections.date)]
        });
      }
    }
    
    return query;
  },
  
  async getInspectionById(id: number) {
    return db.query.inspections.findFirst({
      where: eq(schema.inspections.id, id),
      with: {
        property: true,
        cleaner: true
      }
    });
  },
  
  async getInspectionsByDate(date: string) {
    // Create start and end of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return db.query.inspections.findMany({
      where: and(
        gte(schema.inspections.date, startDate),
        lte(schema.inspections.date, endDate)
      ),
      with: {
        property: true,
        cleaner: true
      },
      orderBy: [schema.inspections.date]
    });
  },
  
  async getUpcomingInspections() {
    const now = new Date();
    
    return db.query.inspections.findMany({
      where: and(
        gte(schema.inspections.date, now),
        eq(schema.inspections.status, 'scheduled')
      ),
      with: {
        property: true,
        cleaner: true
      },
      orderBy: [schema.inspections.date],
      limit: 10
    });
  },
  
  async getRecentlyCompletedInspections() {
    return db.query.inspections.findMany({
      where: or(
        eq(schema.inspections.status, 'completed'),
        eq(schema.inspections.status, 'cancelled')
      ),
      with: {
        property: true,
        cleaner: true
      },
      orderBy: [desc(schema.inspections.updatedAt)],
      limit: 3
    });
  },
  
  async insertInspection(inspection: {
    propertyId: number;
    cleanerId: number;
    date: Date | string;
    durationMinutes: number;
    status: string;
    notes?: string | null;
  }) {
    // Ensure date is a Date object
    const inspectionData = {
      ...inspection,
      date: inspection.date instanceof Date ? inspection.date : new Date(inspection.date)
    };

    const [newInspection] = await db.insert(schema.inspections)
      .values(inspectionData)
      .returning();
    
    return this.getInspectionById(newInspection.id);
  },
  
  async updateInspection(id: number, inspection: Partial<schema.InsertInspection>) {
    // Update the updatedAt timestamp
    const updatedValues = {
      ...inspection,
      updatedAt: new Date()
    };
    
    const [updatedInspection] = await db.update(schema.inspections)
      .set(updatedValues)
      .where(eq(schema.inspections.id, id))
      .returning();
    
    return this.getInspectionById(updatedInspection.id);
  },
  
  async updateInspectionStatus(id: number, update: schema.UpdateInspectionStatus) {
    const { status, issues, cancellationReason } = update;
    
    // Only include fields that were provided
    const updateValues: Record<string, unknown> = {
      status,
      updatedAt: new Date()
    };
    
    if (issues !== undefined) {
      updateValues.issues = issues;
    }
    
    if (cancellationReason !== undefined) {
      updateValues.cancellationReason = cancellationReason;
    }
    
    const [updatedInspection] = await db.update(schema.inspections)
      .set(updateValues)
      .where(eq(schema.inspections.id, id))
      .returning();
    
    return this.getInspectionById(updatedInspection.id);
  },
  
  // Payment status operations
  async updatePaymentStatus(id: number, update: { paymentStatus: string; paymentId?: string }) {
    const updateValues: Record<string, unknown> = {
      paymentStatus: update.paymentStatus,
      updatedAt: new Date()
    };
    
    if (update.paymentId) {
      updateValues.paymentId = update.paymentId;
    }
    
    const [updatedInspection] = await db.update(schema.inspections)
      .set(updateValues)
      .where(eq(schema.inspections.id, id))
      .returning();
    
    return this.getInspectionById(updatedInspection.id);
  },
  
  // ===== Add-ons =====
  async getAllAddons() {
    return db.query.addons.findMany({
      where: eq(schema.addons.isActive, true),
      orderBy: [desc(schema.addons.createdAt)]
    });
  },
  
  async getAddonById(id: number) {
    return db.query.addons.findFirst({
      where: eq(schema.addons.id, id)
    });
  },
  
  async insertAddon(addon: schema.InsertAddon) {
    const [newAddon] = await db.insert(schema.addons)
      .values(addon)
      .returning();
    return newAddon;
  },
  
  async updateAddon(id: number, addon: Partial<schema.InsertAddon>) {
    const [updatedAddon] = await db.update(schema.addons)
      .set(addon)
      .where(eq(schema.addons.id, id))
      .returning();
    return updatedAddon;
  },
  
  // ===== Inspection Add-ons =====
  async getInspectionAddons(inspectionId: number) {
    return db.query.inspectionAddons.findMany({
      where: eq(schema.inspectionAddons.inspectionId, inspectionId),
      with: {
        addon: true
      }
    });
  },
  
  async addInspectionAddon(inspectionId: number, addonId: number, quantity: number = 1) {
    const existingRecord = await db.query.inspectionAddons.findFirst({
      where: and(
        eq(schema.inspectionAddons.inspectionId, inspectionId),
        eq(schema.inspectionAddons.addonId, addonId)
      )
    });
    
    if (existingRecord) {
      // Update quantity if already exists
      const [updated] = await db.update(schema.inspectionAddons)
        .set({ quantity })
        .where(and(
          eq(schema.inspectionAddons.inspectionId, inspectionId),
          eq(schema.inspectionAddons.addonId, addonId)
        ))
        .returning();
      return updated;
    } else {
      // Create new record
      const [newRecord] = await db.insert(schema.inspectionAddons)
        .values({
          inspectionId,
          addonId,
          quantity
        })
        .returning();
      return newRecord;
    }
  },
  
  async removeInspectionAddon(inspectionId: number, addonId: number) {
    const [removed] = await db.delete(schema.inspectionAddons)
      .where(and(
        eq(schema.inspectionAddons.inspectionId, inspectionId),
        eq(schema.inspectionAddons.addonId, addonId)
      ))
      .returning();
    return removed;
  },
  
  // Get inspection with add-ons
  async getInspectionWithAddons(id: number) {
    const inspection = await this.getInspectionById(id);
    if (!inspection) return null;
    
    const addons = await this.getInspectionAddons(id);
    
    return {
      ...inspection,
      addons
    };
  },
  
  // Checklist related functions
  async getPropertyChecklist(propertyId: number) {
    const sections = await db.query.checklistSections.findMany({
      where: eq(schema.checklistSections.propertyId, propertyId),
      orderBy: [schema.checklistSections.order],
      with: {
        items: {
          orderBy: [schema.checklistItems.order]
        }
      }
    });
    
    return { sections };
  },
  
  async createChecklistSection(data: schema.InsertChecklistSection) {
    // Get the count of existing sections to determine the order if not provided
    const existingSections = await db.query.checklistSections.findMany({
      where: eq(schema.checklistSections.propertyId, data.propertyId)
    });
    
    const [section] = await db.insert(schema.checklistSections)
      .values({
        ...data,
        order: data.order ?? existingSections.length
      })
      .returning();
      
    return section;
  },
  
  async updateChecklistSection(id: number, data: Partial<schema.InsertChecklistSection>) {
    const [section] = await db.update(schema.checklistSections)
      .set(data)
      .where(eq(schema.checklistSections.id, id))
      .returning();
      
    return section;
  },
  
  async deleteChecklistSection(id: number) {
    // First delete all items in the section
    await db.delete(schema.checklistItems)
      .where(eq(schema.checklistItems.sectionId, id));
      
    // Then delete the section
    await db.delete(schema.checklistSections)
      .where(eq(schema.checklistSections.id, id));
      
    return { success: true };
  },
  
  async createChecklistItem(data: schema.InsertChecklistItem & { imageUrl?: string }) {
    // Get the count of existing items in this section to determine the order if not provided
    const existingItems = await db.query.checklistItems.findMany({
      where: eq(schema.checklistItems.sectionId, data.sectionId)
    });
    
    const [item] = await db.insert(schema.checklistItems)
      .values({
        ...data,
        order: data.order ?? existingItems.length
      })
      .returning();
      
    return item;
  },
  
  async updateChecklistItem(id: number, data: Partial<schema.InsertChecklistItem> & { imageUrl?: string }) {
    const [item] = await db.update(schema.checklistItems)
      .set(data)
      .where(eq(schema.checklistItems.id, id))
      .returning();
      
    return item;
  },
  
  async deleteChecklistItem(id: number) {
    await db.delete(schema.checklistItems)
      .where(eq(schema.checklistItems.id, id));
      
    return { success: true };
  }
};
