import { type User, type InsertUser, type Person, type InsertPerson, type Client, type InsertClient, type Job, type InsertJob, type JobPeople, type InsertJobPeople, people, clients, jobs, jobPeople } from "@shared/schema";
import { db } from "./db";
import { eq, inArray, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // People methods
  getAllPeople(): Promise<Person[]>;
  getPerson(id: string): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: string, person: Partial<InsertPerson>): Promise<Person | undefined>;
  deletePerson(id: string): Promise<boolean>;
  
  // Client methods
  getAllClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  
  // Job methods
  getAllJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  addPersonToJob(jobId: string, personId: string): Promise<boolean>;
  removePersonFromJob(jobId: string, personId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods (legacy - keeping for backward compatibility)
  async getUser(id: string): Promise<User | undefined> {
    // Legacy user implementation would go here if needed
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Legacy user implementation would go here if needed
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Legacy user implementation would go here if needed
    throw new Error("User creation not implemented");
  }

  // People methods
  async getAllPeople(): Promise<Person[]> {
    const result = await db.select().from(people).orderBy(people.name);
    return result;
  }

  async getPerson(id: string): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(eq(people.id, id));
    return person || undefined;
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const [person] = await db
      .insert(people)
      .values(insertPerson)
      .returning();
    return person;
  }

  async updatePerson(id: string, updateData: Partial<InsertPerson>): Promise<Person | undefined> {
    const [person] = await db
      .update(people)
      .set(updateData)
      .where(eq(people.id, id))
      .returning();
    return person || undefined;
  }

  async deletePerson(id: string): Promise<boolean> {
    const result = await db
      .delete(people)
      .where(eq(people.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Client methods
  async getAllClients(): Promise<Client[]> {
    const result = await db.select().from(clients).orderBy(clients.name);
    return result;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(eq(clients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Job methods with proper relational handling
  async getAllJobs(): Promise<Job[]> {
    const result = await db.select().from(jobs).orderBy(jobs.createdAt);
    return result;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    // Extract assignedPeople from the insertJob (frontend compatibility)
    const { assignedPeople, ...jobData } = insertJob;
    
    // Create the job first
    const [job] = await db
      .insert(jobs)
      .values(jobData)
      .returning();
    
    // Create job-people relationships if any people are assigned
    if (assignedPeople && assignedPeople.length > 0) {
      const jobPeopleData = assignedPeople.map(personId => ({
        jobId: job.id,
        personId,
      }));
      
      await db.insert(jobPeople).values(jobPeopleData);
    }
    
    return job;
  }

  async updateJob(id: string, updateData: Partial<InsertJob>): Promise<Job | undefined> {
    // Extract assignedPeople from the update data
    const { assignedPeople, ...jobData } = updateData;
    
    // Update the job data
    const [job] = await db
      .update(jobs)
      .set(jobData)
      .where(eq(jobs.id, id))
      .returning();
    
    if (!job) return undefined;
    
    // Update people assignments if provided
    if (assignedPeople !== undefined) {
      // Remove all existing assignments for this job
      await db.delete(jobPeople).where(eq(jobPeople.jobId, id));
      
      // Add new assignments if any
      if (assignedPeople.length > 0) {
        const jobPeopleData = assignedPeople.map(personId => ({
          jobId: id,
          personId,
        }));
        
        await db.insert(jobPeople).values(jobPeopleData);
      }
    }
    
    return job;
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db
      .delete(jobs)
      .where(eq(jobs.id, id));
    // Job-people relationships will be automatically deleted due to CASCADE
    return (result.rowCount ?? 0) > 0;
  }

  async addPersonToJob(jobId: string, personId: string): Promise<boolean> {
    try {
      // Check if the job exists
      const job = await this.getJob(jobId);
      if (!job) return false;
      
      // Check if the person exists
      const person = await this.getPerson(personId);
      if (!person) return false;
      
      // Check if assignment already exists
      const existing = await db
        .select()
        .from(jobPeople)
        .where(and(eq(jobPeople.jobId, jobId), eq(jobPeople.personId, personId)));
      
      if (existing.length > 0) return false; // Already assigned
      
      // Add the assignment
      await db.insert(jobPeople).values({
        jobId,
        personId,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding person to job:", error);
      return false;
    }
  }

  async removePersonFromJob(jobId: string, personId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(jobPeople)
        .where(and(eq(jobPeople.jobId, jobId), eq(jobPeople.personId, personId)));
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error removing person from job:", error);
      return false;
    }
  }

  // Helper method to get job with assigned people
  async getJobWithPeople(id: string): Promise<(Job & { assignedPeople: string[] }) | undefined> {
    const job = await this.getJob(id);
    if (!job) return undefined;
    
    const assignments = await db
      .select({ personId: jobPeople.personId })
      .from(jobPeople)
      .where(eq(jobPeople.jobId, id));
    
    return {
      ...job,
      assignedPeople: assignments.map(a => a.personId),
    };
  }

  // Helper method to get all jobs with assigned people
  async getAllJobsWithPeople(): Promise<(Job & { assignedPeople: string[] })[]> {
    const allJobs = await this.getAllJobs();
    
    const result = await Promise.all(
      allJobs.map(async (job) => {
        const assignments = await db
          .select({ personId: jobPeople.personId })
          .from(jobPeople)
          .where(eq(jobPeople.jobId, job.id));
        
        return {
          ...job,
          assignedPeople: assignments.map(a => a.personId),
        };
      })
    );
    
    return result;
  }
}

export const storage = new DatabaseStorage();
