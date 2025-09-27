import { type User, type InsertUser, type Person, type InsertPerson, type Client, type InsertClient, people, clients } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
