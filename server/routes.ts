import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as schema from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any, // Cast to any to avoid type issues with different Stripe versions
});

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiPrefix = "/api";

  // PROPERTIES ROUTES
  app.get(`${apiPrefix}/properties`, async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get(`${apiPrefix}/properties/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await storage.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post(`${apiPrefix}/properties`, async (req, res) => {
    try {
      const validatedData = schema.insertPropertySchema.parse(req.body);
      const newProperty = await storage.insertProperty(validatedData);
      res.status(201).json(newProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // CLEANERS ROUTES
  app.get(`${apiPrefix}/cleaners`, async (req, res) => {
    try {
      const cleaners = await storage.getAllCleaners();
      res.json(cleaners);
    } catch (error) {
      console.error("Error fetching cleaners:", error);
      res.status(500).json({ message: "Failed to fetch cleaners" });
    }
  });

  app.get(`${apiPrefix}/cleaners/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cleaner ID" });
      }

      const cleaner = await storage.getCleanerById(id);
      if (!cleaner) {
        return res.status(404).json({ message: "Cleaner not found" });
      }

      res.json(cleaner);
    } catch (error) {
      console.error("Error fetching cleaner:", error);
      res.status(500).json({ message: "Failed to fetch cleaner" });
    }
  });

  app.post(`${apiPrefix}/cleaners`, async (req, res) => {
    try {
      const validatedData = schema.insertCleanerSchema.parse(req.body);
      const newCleaner = await storage.insertCleaner(validatedData);
      res.status(201).json(newCleaner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating cleaner:", error);
      res.status(500).json({ message: "Failed to create cleaner" });
    }
  });

  // INSPECTIONS ROUTES
  app.get(`${apiPrefix}/inspections`, async (req, res) => {
    try {
      const filters: {
        propertyId?: number;
        status?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (req.query.propertyId) {
        const propertyId = parseInt(req.query.propertyId as string);
        if (!isNaN(propertyId)) {
          filters.propertyId = propertyId;
        }
      }

      if (req.query.status && typeof req.query.status === 'string') {
        filters.status = req.query.status;
      }

      if (req.query.startDate && typeof req.query.startDate === 'string') {
        filters.startDate = new Date(req.query.startDate);
      }

      if (req.query.endDate && typeof req.query.endDate === 'string') {
        filters.endDate = new Date(req.query.endDate);
      }

      const inspections = await storage.getAllInspections(filters);
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.get(`${apiPrefix}/inspections/byDate`, async (req, res) => {
    try {
      if (!req.query.date || typeof req.query.date !== 'string') {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      const inspections = await storage.getInspectionsByDate(req.query.date);
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching inspections by date:", error);
      res.status(500).json({ message: "Failed to fetch inspections by date" });
    }
  });

  app.get(`${apiPrefix}/inspections/upcoming`, async (req, res) => {
    try {
      const inspections = await storage.getUpcomingInspections();
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching upcoming inspections:", error);
      res.status(500).json({ message: "Failed to fetch upcoming inspections" });
    }
  });

  app.get(`${apiPrefix}/inspections/recent`, async (req, res) => {
    try {
      const inspections = await storage.getRecentlyCompletedInspections();
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching recent inspections:", error);
      res.status(500).json({ message: "Failed to fetch recent inspections" });
    }
  });

  app.get(`${apiPrefix}/inspections/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inspection ID" });
      }

      const inspection = await storage.getInspectionById(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }

      res.json(inspection);
    } catch (error) {
      console.error("Error fetching inspection:", error);
      res.status(500).json({ message: "Failed to fetch inspection" });
    }
  });

  app.post(`${apiPrefix}/inspections`, async (req, res) => {
    try {
      // For the date, we need to ensure it's a proper Date object
      if (typeof req.body.date === 'string') {
        req.body.date = new Date(req.body.date);
      }
      
      // Validate the inspection data
      const validatedData = schema.insertInspectionSchema.parse(req.body);
      
      // Create the inspection with optional price and payment status
      const inspectionData: any = {
        propertyId: validatedData.propertyId,
        cleanerId: validatedData.cleanerId,
        date: req.body.date, // Use the original Date object
        durationMinutes: validatedData.durationMinutes,
        status: validatedData.status,
        notes: validatedData.notes || null
      };
      
      // Add price if provided
      if (req.body.price) {
        inspectionData.price = parseFloat(req.body.price);
      }
      
      // Set initial payment status
      if (req.body.paymentStatus) {
        inspectionData.paymentStatus = req.body.paymentStatus;
      } else if (req.body.price && parseFloat(req.body.price) > 0) {
        inspectionData.paymentStatus = 'unpaid';
      }
      
      const newInspection = await storage.insertInspection(inspectionData);
      
      res.status(201).json(newInspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating inspection:", error);
      res.status(500).json({ message: "Failed to create inspection" });
    }
  });

  app.patch(`${apiPrefix}/inspections/:id/status`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inspection ID" });
      }

      // Validate the status update
      const validatedData = schema.updateInspectionStatusSchema.parse(req.body);
      
      // Update the inspection status
      const updatedInspection = await storage.updateInspectionStatus(id, validatedData);
      if (!updatedInspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      res.json(updatedInspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating inspection status:", error);
      res.status(500).json({ message: "Failed to update inspection status" });
    }
  });

  // PAYMENT ROUTES
  app.post(`${apiPrefix}/create-payment-intent`, async (req, res) => {
    try {
      const validatedData = schema.createPaymentIntentSchema.parse(req.body);
      const { inspectionId, amount } = validatedData;

      // Get the inspection to ensure it exists and is unpaid
      const inspection = await storage.getInspectionById(inspectionId);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }

      if (inspection.paymentStatus === 'paid') {
        return res.status(400).json({ message: "This inspection has already been paid for" });
      }

      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          inspectionId: inspection.id.toString(),
          propertyName: inspection.property.name,
          date: inspection.date.toString()
        }
      });

      // Update the inspection with payment processing status
      await storage.updatePaymentStatus(inspectionId, {
        paymentStatus: 'processing',
        paymentId: paymentIntent.id
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        inspectionId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post(`${apiPrefix}/payment-webhook`, async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    // Webhook secret should be configured in production
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // For development without signature verification
        event = req.body;
      }
      
      // Handle the event
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const inspectionId = parseInt(paymentIntent.metadata.inspectionId);
        
        // Update inspection payment status to paid
        await storage.updatePaymentStatus(inspectionId, {
          paymentStatus: 'paid',
          paymentId: paymentIntent.id
        });
        
        console.log(`Payment for inspection ${inspectionId} succeeded!`);
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook Error:', err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
