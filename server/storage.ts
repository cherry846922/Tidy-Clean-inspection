import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, gte, lte, or } from "drizzle-orm";

// Property operations
export const storage = {
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
  }
};
