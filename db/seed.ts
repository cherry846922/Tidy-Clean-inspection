import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    console.log("Starting to seed the database...");

    // Seed Properties
    const properties = [
      {
        name: "Seaside Villa",
        address: "123 Beach Road",
        type: "Villa",
        bedrooms: 3,
        bathrooms: 2.5,
      },
      {
        name: "Downtown Apartment",
        address: "456 Main Street, Apt 7B",
        type: "Apartment",
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        name: "Mountain Cabin",
        address: "789 Pine Road",
        type: "Cabin",
        bedrooms: 4,
        bathrooms: 3,
      },
      {
        name: "Lake House",
        address: "321 Lakefront Drive",
        type: "House",
        bedrooms: 5,
        bathrooms: 3.5,
      }
    ];

    for (const property of properties) {
      // Check if property already exists
      const existingProperty = await db.query.properties.findFirst({
        where: (props, { eq }) => eq(props.name, property.name)
      });

      if (!existingProperty) {
        await db.insert(schema.properties).values(property);
        console.log(`Created property: ${property.name}`);
      } else {
        console.log(`Property ${property.name} already exists, skipping`);
      }
    }

    // Seed Cleaners
    const cleaners = [
      {
        name: "John Cleaner",
        email: "john@example.com",
        phone: "555-123-4567",
        isActive: true,
      },
      {
        name: "Maria Cleaner",
        email: "maria@example.com",
        phone: "555-987-6543",
        isActive: true,
      },
      {
        name: "Robert Cleaner",
        email: "robert@example.com",
        phone: "555-555-5555",
        isActive: true,
      }
    ];

    for (const cleaner of cleaners) {
      // Check if cleaner already exists
      const existingCleaner = await db.query.cleaners.findFirst({
        where: (c, { eq }) => eq(c.email, cleaner.email)
      });

      if (!existingCleaner) {
        await db.insert(schema.cleaners).values(cleaner);
        console.log(`Created cleaner: ${cleaner.name}`);
      } else {
        console.log(`Cleaner ${cleaner.name} already exists, skipping`);
      }
    }

    // Seed Inspections
    // First get all properties and cleaners
    const seededProperties = await db.query.properties.findMany();
    const seededCleaners = await db.query.cleaners.findMany();

    if (seededProperties.length > 0 && seededCleaners.length > 0) {
      // Create a date for today
      const today = new Date();
      
      // Create dates for the month (past, present, future)
      const inspectionDates = [];
      
      // Past inspections (some completed, some cancelled)
      for (let i = 10; i > 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // Between 9 AM and 5 PM
        inspectionDates.push(date);
      }
      
      // Today's inspections
      const todayInspection1 = new Date();
      todayInspection1.setHours(11, 0, 0, 0);
      inspectionDates.push(todayInspection1);
      
      const todayInspection2 = new Date();
      todayInspection2.setHours(16, 0, 0, 0);
      inspectionDates.push(todayInspection2);
      
      // Future inspections
      for (let i = 1; i <= 15; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // Between 9 AM and 5 PM
        inspectionDates.push(date);
      }
      
      const inspections = [];
      
      for (let i = 0; i < inspectionDates.length; i++) {
        const propertyIndex = i % seededProperties.length;
        const cleanerIndex = i % seededCleaners.length;
        const date = inspectionDates[i];
        
        // Determine status based on date
        let status = "scheduled";
        let issues = null;
        let cancellationReason = null;
        
        if (date < today) {
          // Past inspections are either completed or cancelled
          status = i % 5 === 0 ? "cancelled" : "completed";
          
          if (status === "completed" && i % 3 === 0) {
            issues = "Minor cleaning issues";
          }
          
          if (status === "cancelled") {
            cancellationReason = "Weather";
          }
        }
        
        inspections.push({
          propertyId: seededProperties[propertyIndex].id,
          cleanerId: seededCleaners[cleanerIndex].id,
          date: date, // This will be automatically converted to ISO string by the ORM
          durationMinutes: 60, // 1 hour default
          status,
          notes: i % 2 === 0 ? "Please check the bathroom thoroughly" : null,
          issues,
          cancellationReason,
        });
      }
      
      // Check if we already have inspections
      const existingInspections = await db.query.inspections.findMany({
        limit: 1
      });
      
      if (existingInspections.length === 0) {
        for (const inspection of inspections) {
          await db.insert(schema.inspections).values(inspection);
        }
        console.log(`Created ${inspections.length} inspections`);
      } else {
        console.log("Inspections already exist, skipping");
      }
    }

    // Seed Addons (new)
    const addons = [
      {
        name: "Lightbulb",
        description: "Replacement lightbulb for any fixture",
        price: "3.99",
        isActive: true,
      },
      {
        name: "Batteries (AA)",
        description: "Pack of 4 AA batteries",
        price: "5.99",
        isActive: true,
      },
      {
        name: "Batteries (AAA)",
        description: "Pack of 4 AAA batteries",
        price: "5.49",
        isActive: true,
      },
      {
        name: "Air Freshener",
        description: "Long-lasting air freshener for any room",
        price: "7.99",
        isActive: true,
      },
      {
        name: "HVAC Filter",
        description: "Standard size HVAC filter replacement",
        price: "14.99",
        isActive: true,
      }
    ];
    
    for (const addon of addons) {
      // Check if addon already exists
      const existingAddon = await db.query.addons.findFirst({
        where: (a, { eq }) => eq(a.name, addon.name)
      });
      
      if (!existingAddon) {
        await db.insert(schema.addons).values(addon);
        console.log(`Created addon: ${addon.name}`);
      } else {
        console.log(`Addon ${addon.name} already exists, skipping`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
