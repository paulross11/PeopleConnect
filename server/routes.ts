import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPersonSchema, insertClientSchema, insertJobSchema, type Person, type Client, type Job } from "@shared/schema";
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

  // Client API routes
  
  // GET /api/clients - Get all clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // GET /api/clients/:id - Get client by ID
  app.get("/api/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  // POST /api/clients - Create new client
  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  // PUT /api/clients/:id - Update client
  app.put("/api/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the update data (partial schema)
      const partialSchema = insertClientSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      
      const client = await storage.updateClient(id, validatedData);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  // DELETE /api/clients/:id - Delete client
  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteClient(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Job API routes
  
  // GET /api/jobs - Get all jobs with assigned people
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobsWithPeople();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // GET /api/jobs/:id - Get job by ID with assigned people
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJobWithPeople(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // POST /api/jobs - Create new job
  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  // PUT /api/jobs/:id - Update job
  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the update data (partial schema)
      const partialSchema = insertJobSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      
      const job = await storage.updateJob(id, validatedData);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error updating job:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  // POST /api/jobs/:id/people - Add person to job
  app.post("/api/jobs/:id/people", async (req, res) => {
    try {
      const { id } = req.params;
      const { personId } = req.body;
      
      if (!personId) {
        return res.status(400).json({ error: "personId is required" });
      }
      
      const success = await storage.addPersonToJob(id, personId);
      
      if (!success) {
        return res.status(404).json({ error: "Job not found or person already assigned" });
      }
      
      res.status(201).json({ message: "Person added to job successfully" });
    } catch (error) {
      console.error("Error adding person to job:", error);
      res.status(500).json({ error: "Failed to add person to job" });
    }
  });

  // DELETE /api/jobs/:id/people/:personId - Remove person from job
  app.delete("/api/jobs/:id/people/:personId", async (req, res) => {
    try {
      const { id, personId } = req.params;
      
      const success = await storage.removePersonFromJob(id, personId);
      
      if (!success) {
        return res.status(404).json({ error: "Job assignment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing person from job:", error);
      res.status(500).json({ error: "Failed to remove person from job" });
    }
  });

  // DELETE /api/jobs/:id - Delete job
  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteJob(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
