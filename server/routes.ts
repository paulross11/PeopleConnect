import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPersonSchema, type Person } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // People API routes
  
  // GET /api/people - Get all people
  app.get("/api/people", async (req, res) => {
    try {
      const people = await storage.getAllPeople();
      res.json(people);
    } catch (error) {
      console.error("Error fetching people:", error);
      res.status(500).json({ error: "Failed to fetch people" });
    }
  });

  // GET /api/people/:id - Get person by ID
  app.get("/api/people/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const person = await storage.getPerson(id);
      
      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }
      
      res.json(person);
    } catch (error) {
      console.error("Error fetching person:", error);
      res.status(500).json({ error: "Failed to fetch person" });
    }
  });

  // POST /api/people - Create new person
  app.post("/api/people", async (req, res) => {
    try {
      const validatedData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(validatedData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating person:", error);
      res.status(500).json({ error: "Failed to create person" });
    }
  });

  // PUT /api/people/:id - Update person
  app.put("/api/people/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the update data (partial schema)
      const partialSchema = insertPersonSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      
      const person = await storage.updatePerson(id, validatedData);
      
      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }
      
      res.json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error updating person:", error);
      res.status(500).json({ error: "Failed to update person" });
    }
  });

  // DELETE /api/people/:id - Delete person
  app.delete("/api/people/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePerson(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Person not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting person:", error);
      res.status(500).json({ error: "Failed to delete person" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
