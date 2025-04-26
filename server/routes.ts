import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as schema from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";
import { setupAuth, hashPassword, comparePasswords } from "./auth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any, // Cast to any to avoid type issues with different Stripe versions
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { requireAuth } = setupAuth(app);
  
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
  
  // Update inspection details
  app.patch(`${apiPrefix}/inspections/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inspection ID" });
      }

      // Allow partial updates to various fields
      const updatedInspection = await storage.updateInspection(id, req.body);
      if (!updatedInspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      res.json(updatedInspection);
    } catch (error) {
      console.error("Error updating inspection:", error);
      res.status(500).json({ message: "Failed to update inspection" });
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
  
  // ===== Add-ons Routes =====
  
  // Get all active add-ons
  app.get(`${apiPrefix}/addons`, async (req, res) => {
    try {
      const addons = await storage.getAllAddons();
      res.json(addons);
    } catch (error) {
      console.error("Error fetching add-ons:", error);
      res.status(500).json({ message: "Failed to fetch add-ons" });
    }
  });
  
  // Get single addon by id
  app.get(`${apiPrefix}/addons/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid add-on ID" });
      }
      
      const addon = await storage.getAddonById(id);
      if (!addon) {
        return res.status(404).json({ message: "Add-on not found" });
      }
      
      res.json(addon);
    } catch (error) {
      console.error("Error fetching add-on:", error);
      res.status(500).json({ message: "Failed to fetch add-on" });
    }
  });
  
  // Create a new add-on
  app.post(`${apiPrefix}/addons`, async (req, res) => {
    try {
      const validatedData = schema.insertAddonSchema.parse(req.body);
      const newAddon = await storage.insertAddon(validatedData);
      res.status(201).json(newAddon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating add-on:", error);
      res.status(500).json({ message: "Failed to create add-on" });
    }
  });
  
  // Update add-on
  app.patch(`${apiPrefix}/addons/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid add-on ID" });
      }
      
      const validatedData = schema.insertAddonSchema.partial().parse(req.body);
      const updatedAddon = await storage.updateAddon(id, validatedData);
      
      if (!updatedAddon) {
        return res.status(404).json({ message: "Add-on not found" });
      }
      
      res.json(updatedAddon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating add-on:", error);
      res.status(500).json({ message: "Failed to update add-on" });
    }
  });
  
  // ===== Inspection Add-ons Routes =====
  
  // Get all add-ons for an inspection
  app.get(`${apiPrefix}/inspections/:id/addons`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inspection ID" });
      }
      
      const inspection = await storage.getInspectionById(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      const addons = await storage.getInspectionAddons(id);
      res.json(addons);
    } catch (error) {
      console.error("Error fetching inspection add-ons:", error);
      res.status(500).json({ message: "Failed to fetch inspection add-ons" });
    }
  });
  
  // Add an add-on to an inspection
  app.post(`${apiPrefix}/inspections/:id/addons`, async (req, res) => {
    try {
      const inspectionId = parseInt(req.params.id);
      if (isNaN(inspectionId)) {
        return res.status(400).json({ message: "Invalid inspection ID" });
      }
      
      const { addonId, quantity } = req.body;
      
      if (!addonId || isNaN(parseInt(addonId))) {
        return res.status(400).json({ message: "Invalid add-on ID" });
      }
      
      const addonIdNum = parseInt(addonId);
      const quantityNum = quantity ? parseInt(quantity) : 1;
      
      // Validate that both inspection and add-on exist
      const inspection = await storage.getInspectionById(inspectionId);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      const addon = await storage.getAddonById(addonIdNum);
      if (!addon) {
        return res.status(404).json({ message: "Add-on not found" });
      }
      
      const result = await storage.addInspectionAddon(inspectionId, addonIdNum, quantityNum);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding add-on to inspection:", error);
      res.status(500).json({ message: "Failed to add add-on to inspection" });
    }
  });
  
  // Remove an add-on from an inspection
  app.delete(`${apiPrefix}/inspections/:inspectionId/addons/:addonId`, async (req, res) => {
    try {
      const inspectionId = parseInt(req.params.inspectionId);
      const addonId = parseInt(req.params.addonId);
      
      if (isNaN(inspectionId) || isNaN(addonId)) {
        return res.status(400).json({ message: "Invalid IDs provided" });
      }
      
      const result = await storage.removeInspectionAddon(inspectionId, addonId);
      
      if (!result) {
        return res.status(404).json({ message: "Add-on not found for this inspection" });
      }
      
      res.json({ message: "Add-on removed from inspection" });
    } catch (error) {
      console.error("Error removing add-on from inspection:", error);
      res.status(500).json({ message: "Failed to remove add-on from inspection" });
    }
  });
  
  // Get inspection with add-ons
  app.get(`${apiPrefix}/inspections/:id/with-addons`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inspection ID" });
      }
      
      const inspection = await storage.getInspectionWithAddons(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      res.json(inspection);
    } catch (error) {
      console.error("Error fetching inspection with add-ons:", error);
      res.status(500).json({ message: "Failed to fetch inspection with add-ons" });
    }
  });
  
  // Base rate settings
  app.post(`${apiPrefix}/settings/base-rate`, requireAuth, async (req, res) => {
    try {
      // Only inspectors can update base rate
      if (req.user?.role !== "inspector") {
        return res.status(403).json({ message: "Only inspectors can update base rates" });
      }
      
      const { rate } = req.body;
      if (!rate || isNaN(parseFloat(rate))) {
        return res.status(400).json({ message: "Valid rate is required" });
      }
      
      // In a real application, you would save this to a settings table
      // For now, we'll just return success
      res.json({ success: true, rate });
    } catch (error) {
      console.error("Error updating base rate:", error);
      res.status(500).json({ message: "Failed to update base rate" });
    }
  });
  
  // User profile update
  app.put(`${apiPrefix}/user/profile`, requireAuth, async (req, res) => {
    try {
      const { email, name, phone } = req.body;
      
      // Update user profile
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updatedUser = await storage.updateUser(req.user.id, {
        email,
        name,
        phone
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Password update
  app.put(`${apiPrefix}/user/password`, requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }
      
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, req.user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user password
      const updatedUser = await storage.updateUser(req.user.id, {
        password: hashedPassword
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Host dashboard endpoints
  app.get(`${apiPrefix}/dashboard/host`, requireAuth, async (req, res) => {
    try {
      // Get user ID from authenticated session
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get current date for calculations
      const today = new Date();
      
      // Get properties belonging to this host
      const userProperties = await storage.getAllProperties();
      
      // Get all inspections for the host's properties
      const allInspections = await Promise.all(
        userProperties.map(async (property) => {
          const inspections = await storage.getAllInspections({ propertyId: property.id });
          return inspections;
        })
      );
      
      // Flatten inspections array
      const inspections = allInspections.flat();
      
      // Calculate basic metrics
      const totalInspections = inspections.length;
      const completedInspections = inspections.filter(i => i.status === 'completed').length;
      const scheduledInspections = inspections.filter(i => i.status === 'scheduled').length;
      const cancelledInspections = inspections.filter(i => i.status === 'cancelled').length;
      
      // Calculate completion rate
      const completionRate = totalInspections > 0 
        ? Math.round((completedInspections / totalInspections) * 100) 
        : 0;
      
      // Get upcoming inspections (next 7 days)
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingInspections = inspections.filter(i => {
        const inspectionDate = new Date(i.date);
        return i.status === 'scheduled' && 
               inspectionDate >= today && 
               inspectionDate <= nextWeek;
      });
      
      // Calculate average health score across properties with scores
      const propertiesWithScore = userProperties.filter(p => p.healthScore !== null && p.healthScore !== undefined);
      const avgHealthScore = propertiesWithScore.length > 0
        ? Math.round(propertiesWithScore.reduce((sum, p) => sum + (p.healthScore || 0), 0) / propertiesWithScore.length)
        : null;
      
      // Get monthly inspection counts for charts (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today);
        month.setMonth(month.getMonth() - i);
        const monthName = month.toLocaleString('default', { month: 'short' });
        const monthYear = month.toLocaleString('default', { month: 'short', year: '2-digit' });
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const monthCompletedCount = inspections.filter(i => {
          const inspDate = new Date(i.date);
          return i.status === 'completed' && 
                 inspDate >= startDate && 
                 inspDate <= endDate;
        }).length;
        
        const monthScheduledCount = inspections.filter(i => {
          const inspDate = new Date(i.date);
          return i.status === 'scheduled' && 
                 inspDate >= startDate && 
                 inspDate <= endDate;
        }).length;
        
        monthlyData.push({
          month: monthName,
          label: monthYear,
          completed: monthCompletedCount,
          scheduled: monthScheduledCount
        });
      }
      
      // Get property performance for comparison
      const propertyPerformance = userProperties.map(property => {
        const propertyInspections = inspections.filter(i => i.propertyId === property.id);
        const completedCount = propertyInspections.filter(i => i.status === 'completed').length;
        const cancelledCount = propertyInspections.filter(i => i.status === 'cancelled').length;
        const totalCount = propertyInspections.length;
        
        return {
          id: property.id,
          name: property.name,
          healthScore: property.healthScore || 0,
          completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          inspectionCount: totalCount
        };
      });
      
      res.json({
        summary: {
          properties: userProperties.length,
          totalInspections,
          completedInspections,
          scheduledInspections,
          cancelledInspections,
          completionRate,
          avgHealthScore
        },
        upcomingInspections,
        monthlyData,
        propertyPerformance
      });
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Property health score endpoints
  app.post(`${apiPrefix}/properties/health-score`, requireAuth, async (req, res) => {
    try {
      const validatedData = schema.generateHealthScoreSchema.parse(req.body);
      const { propertyId } = validatedData;
      
      // Check if property exists
      const property = await storage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Generate a health score based on property data and past inspections
      // This is a simplified scoring system - in a real app, you might have more sophisticated criteria
      
      // For demonstration, generate scores between 60-95
      const baseScore = Math.floor(Math.random() * 36) + 60;
      
      // Calculate sub-scores for different categories
      const cleanliness = Math.floor(Math.random() * 31) + 70;
      const maintenance = Math.floor(Math.random() * 41) + 60;
      const amenities = Math.floor(Math.random() * 21) + 80;
      const safety = Math.floor(Math.random() * 26) + 75;
      
      // Save the health score to the property
      await storage.updatePropertyHealthScore(propertyId, baseScore);
      
      // Return the score details
      res.json({
        propertyId,
        score: baseScore,
        lastChecked: new Date(),
        details: {
          cleanliness,
          maintenance,
          amenities,
          safety
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error generating health score:", error);
      res.status(500).json({ message: "Failed to generate health score" });
    }
  });
  
  // Get property health score
  app.get(`${apiPrefix}/properties/:id/health-score`, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const propertyInfo = await storage.getPropertyHealthScore(propertyId);
      
      if (!propertyInfo) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (!propertyInfo.healthScore) {
        return res.status(404).json({ 
          message: "No health score available",
          detail: "Generate a health score first"
        });
      }
      
      res.json({
        propertyId: propertyInfo.id,
        score: propertyInfo.healthScore,
        lastChecked: propertyInfo.lastHealthCheck
      });
      
    } catch (error) {
      console.error("Error retrieving health score:", error);
      res.status(500).json({ message: "Failed to retrieve health score" });
    }
  });
  
  // Generate property improvement suggestions and feedback
  app.get(`${apiPrefix}/properties/:id/feedback-suggestions`, requireAuth, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      // Get property details
      const property = await storage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Get property health score
      const healthScore = await storage.getPropertyHealthScore(propertyId);
      
      // Get property's inspections to analyze trends and issues
      const inspections = await storage.getAllInspections({ propertyId });
      
      // Generate suggestions based on property data
      // In a real app, this might use machine learning or analysis of inspection history
      // For demo purposes, we'll generate some example suggestions
      
      const suggestions: schema.FeedbackSuggestion[] = [];
      
      // Check for health score and generate suggestions based on score categories
      if (healthScore?.healthScore) {
        // Generate cleanliness suggestions
        if (Math.random() > 0.5) {
          const cleanlinessScore = Math.floor(Math.random() * 40) + 60;
          suggestions.push({
            category: "Cleanliness",
            score: cleanlinessScore,
            issue: cleanlinessScore < 80 ? "Bathroom cleaning standards need improvement" : "Minor dust accumulation in hard-to-reach areas",
            suggestion: cleanlinessScore < 80 
              ? "Implement a detailed bathroom cleaning checklist for cleaners with special attention to grout and corners" 
              : "Consider quarterly deep cleaning for crown molding and ceiling fans",
            priority: cleanlinessScore < 70 ? "high" : cleanlinessScore < 85 ? "medium" : "low"
          });
        }
        
        // Generate maintenance suggestions
        if (Math.random() > 0.4) {
          const maintenanceScore = Math.floor(Math.random() * 40) + 60;
          suggestions.push({
            category: "Maintenance",
            score: maintenanceScore,
            issue: maintenanceScore < 75 ? "Multiple fixtures showing signs of wear" : "Minor paint touch-ups needed in common areas",
            suggestion: maintenanceScore < 75 
              ? "Schedule quarterly maintenance checks for all plumbing fixtures and address any issues immediately" 
              : "Refresh paint in high-traffic areas to maintain a clean appearance",
            priority: maintenanceScore < 70 ? "high" : maintenanceScore < 85 ? "medium" : "low"
          });
        }
        
        // Generate amenities suggestions
        if (Math.random() > 0.6) {
          const amenitiesScore = Math.floor(Math.random() * 30) + 70;
          suggestions.push({
            category: "Amenities",
            score: amenitiesScore,
            issue: "Guest feedback indicates desire for better kitchen supplies",
            suggestion: "Consider upgrading kitchen utensils and adding a quality coffee maker to enhance guest experience",
            priority: amenitiesScore < 75 ? "medium" : "low"
          });
        }
        
        // Generate safety suggestions
        if (Math.random() > 0.7) {
          const safetyScore = Math.floor(Math.random() * 25) + 75;
          suggestions.push({
            category: "Safety",
            score: safetyScore,
            issue: safetyScore < 85 ? "Smoke detectors need battery replacement" : "Emergency information not prominently displayed",
            suggestion: safetyScore < 85 
              ? "Implement a monthly smoke detector check protocol and replace batteries immediately when needed" 
              : "Create and display an emergency contact card in a visible location",
            priority: safetyScore < 85 ? "high" : "medium"
          });
        }
      }
      
      // Check recent inspections for recurring issues
      if (inspections.length > 0) {
        // Analyze inspection history (simplified for demo)
        const completedInspections = inspections.filter(i => i.status === 'completed');
        const hasRecurringIssues = completedInspections.length > 2 && Math.random() > 0.6;
        
        if (hasRecurringIssues) {
          suggestions.push({
            category: "Recurring Issues",
            score: 65,
            issue: "Multiple inspections have noted the same cleaning issues in the kitchen area",
            suggestion: "Consider a specialized deep clean for kitchen, focusing on appliances and behind/under cabinets",
            priority: "medium"
          });
        }
      }
      
      // Add a suggestion based on property type/location (for demo)
      if (property.type === "house" || !property.type) {
        suggestions.push({
          category: "Guest Experience",
          score: 82,
          issue: "Property lacks personal touches that guests appreciate",
          suggestion: "Add location-specific guidebooks, local artwork, or welcome amenities to create a more memorable stay",
          priority: "low"
        });
      }
      
      // Sort suggestions by priority: high, medium, low
      const sortedSuggestions = suggestions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      // Return the feedback response
      res.json({
        propertyId,
        propertyName: property.name,
        suggestions: sortedSuggestions
      });
      
    } catch (error) {
      console.error("Error generating feedback suggestions:", error);
      res.status(500).json({ message: "Failed to generate feedback suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
