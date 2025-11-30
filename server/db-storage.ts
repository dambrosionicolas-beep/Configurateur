import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import {
  users,
  clients,
  configurationTemplates,
  configurationSessions,
  type User,
  type InsertUser,
  type Client,
  type InsertClient,
  type ConfigurationTemplate,
  type InsertConfigurationTemplate,
  type ConfigurationSession,
} from "@shared/schema";
import type { IStorage } from "./storage";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Configuration session methods (API keys NEVER stored)
  async createConfigurationSession(
    industry: string,
    status: string,
    clientId?: string
  ): Promise<ConfigurationSession> {
    const result = await db
      .insert(configurationSessions)
      .values({
        industry,
        status,
        clientId: clientId || null,
      })
      .returning();
    return result[0];
  }

  async getConfigurationSession(
    id: string
  ): Promise<ConfigurationSession | undefined> {
    const result = await db
      .select()
      .from(configurationSessions)
      .where(eq(configurationSessions.id, id));
    return result[0];
  }

  async updateConfigurationSession(
    id: string,
    updates: Partial<ConfigurationSession>
  ): Promise<ConfigurationSession | undefined> {
    const result = await db
      .update(configurationSessions)
      .set(updates)
      .where(eq(configurationSessions.id, id))
      .returning();
    return result[0];
  }

  async getAllConfigurationSessions(): Promise<ConfigurationSession[]> {
    return await db
      .select()
      .from(configurationSessions)
      .orderBy(desc(configurationSessions.createdAt));
  }

  async getConfigurationSessionsByClient(
    clientId: string
  ): Promise<ConfigurationSession[]> {
    return await db
      .select()
      .from(configurationSessions)
      .where(eq(configurationSessions.clientId, clientId))
      .orderBy(desc(configurationSessions.createdAt));
  }

  // Client methods
  async createClient(insertClient: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(insertClient).returning();
    return result[0];
  }

  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }

  async getAllClients(): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));
  }

  async updateClient(
    id: string,
    updates: Partial<Client>
  ): Promise<Client | undefined> {
    const result = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Configuration template methods
  async createConfigurationTemplate(
    insertTemplate: InsertConfigurationTemplate
  ): Promise<ConfigurationTemplate> {
    const result = await db
      .insert(configurationTemplates)
      .values(insertTemplate)
      .returning();
    return result[0];
  }

  async getConfigurationTemplate(
    id: string
  ): Promise<ConfigurationTemplate | undefined> {
    const result = await db
      .select()
      .from(configurationTemplates)
      .where(eq(configurationTemplates.id, id));
    return result[0];
  }

  async getAllConfigurationTemplates(): Promise<ConfigurationTemplate[]> {
    return await db
      .select()
      .from(configurationTemplates)
      .orderBy(desc(configurationTemplates.createdAt));
  }

  async getConfigurationTemplatesByIndustry(
    industry: string
  ): Promise<ConfigurationTemplate[]> {
    return await db
      .select()
      .from(configurationTemplates)
      .where(eq(configurationTemplates.industry, industry))
      .orderBy(desc(configurationTemplates.createdAt));
  }

  async updateConfigurationTemplate(
    id: string,
    updates: Partial<ConfigurationTemplate>
  ): Promise<ConfigurationTemplate | undefined> {
    const result = await db
      .update(configurationTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(configurationTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteConfigurationTemplate(id: string): Promise<boolean> {
    const result = await db
      .delete(configurationTemplates)
      .where(eq(configurationTemplates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}
