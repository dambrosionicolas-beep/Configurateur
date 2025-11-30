import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Clients table - for multi-client management
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  primaryIndustry: text("primary_industry"),
  metadata: jsonb("metadata"), // Additional client information
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Configuration templates table - for reusable configurations
export const configurationTemplates = pgTable("configuration_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  description: text("description"),
  configuration: jsonb("configuration").notNull(), // GeneratedConfig JSON
  isPublic: text("is_public").notNull().default('false'), // 'true' | 'false'
  createdBy: text("created_by"), // Optional: for multi-user scenarios
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConfigurationTemplateSchema = createInsertSchema(configurationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConfigurationTemplate = z.infer<typeof insertConfigurationTemplateSchema>;
export type ConfigurationTemplate = typeof configurationTemplates.$inferSelect;

// Configuration sessions table
// NOTE: hubspotApiKey is NEVER stored - only used during request processing
export const configurationSessions = pgTable("configuration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id"), // Optional: link to client
  industry: text("industry").notNull(),
  status: text("status").notNull(), // 'connecting' | 'generating' | 'applying' | 'completed' | 'error'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  generatedConfig: jsonb("generated_config"), // Stores the AI-generated configuration
  appliedConfig: jsonb("applied_config"), // Stores what was actually created in HubSpot
});

export const insertConfigurationSessionSchema = createInsertSchema(configurationSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertConfigurationSession = z.infer<typeof insertConfigurationSessionSchema>;
export type ConfigurationSession = typeof configurationSessions.$inferSelect;

// Industry type (used for selection)
export type Industry = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
};

// HubSpot Configuration Types
export type HubSpotProperty = {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  groupName: string;
  description?: string;
  options?: { label: string; value: string }[];
};

export type HubSpotList = {
  name: string;
  processingType: string;
  filterGroups: any[];
};

export type HubSpotWorkflow = {
  name: string;
  type: string;
  enabled: boolean;
  actions: any[];
  triggers: any[];
};

export type GeneratedConfig = {
  properties: HubSpotProperty[];
  lists: HubSpotList[];
  workflows: HubSpotWorkflow[];
};

export type AppliedConfig = {
  properties: Array<{ id: string; name: string; label: string }>;
  lists: Array<{ id: string; name: string }>;
  workflows: Array<{ id: string; name: string }>;
};

// Form schemas
export const industrySelectionSchema = z.object({
  industryId: z.string().min(1, "Veuillez sélectionner un secteur d'activité"),
});

export const hubspotConnectionSchema = z.object({
  apiKey: z.string().min(10, "La clé API doit contenir au moins 10 caractères"),
});

export type IndustrySelection = z.infer<typeof industrySelectionSchema>;
export type HubSpotConnection = z.infer<typeof hubspotConnectionSchema>;
