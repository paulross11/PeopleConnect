import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Extra contact type for clients
export interface ExtraContact {
  name: string;
  phone?: string;
  email?: string;
}

// People table
export const people = pgTable("people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  telephone: text("telephone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  leadContact: text("lead_contact"),
  leadContactPhone: text("lead_contact_phone"),
  leadContactEmail: text("lead_contact_email"),
  extraContacts: json("extra_contacts").$type<ExtraContact[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  jobDate: timestamp("job_date"),
  address: text("address"),
  fee: integer("fee"), // Fee amount in cents to avoid decimal precision issues
  assignedPeople: json("assigned_people").$type<string[]>().default([]), // Array of person IDs
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const peopleRelations = relations(people, ({ many }) => ({
  // Note: People are now linked to jobs via assignedPeople JSON array, not direct foreign key
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  client: one(clients, {
    fields: [jobs.clientId],
    references: [clients.id],
  }),
}));

// Extra contact schema for validation
export const extraContactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
});

// Insert schemas
export const insertPersonSchema = createInsertSchema(people).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
}).extend({
  extraContacts: z.array(extraContactSchema).default([]),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
}).extend({
  assignedPeople: z.array(z.string()).default([]),
  clientId: z.string().min(1, "Client is required"),
  fee: z.number().min(0, "Fee must be non-negative").optional(),
});

// Types
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Keep existing user schema for backwards compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
