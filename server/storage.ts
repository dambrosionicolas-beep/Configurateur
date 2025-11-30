import {
  type User,
  type InsertUser,
  type ConfigurationSession,
  type InsertConfigurationSession,
} from "@shared/schema";
import { randomUUID } from "crypto";

import type { Client, InsertClient, ConfigurationTemplate, InsertConfigurationTemplate } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Configuration sessions (API keys NEVER stored)
  createConfigurationSession(
    industry: string,
    status: string,
    clientId?: string
  ): Promise<ConfigurationSession>;
  getConfigurationSession(id: string): Promise<ConfigurationSession | undefined>;
  updateConfigurationSession(
    id: string,
    updates: Partial<ConfigurationSession>
  ): Promise<ConfigurationSession | undefined>;
  getAllConfigurationSessions(): Promise<ConfigurationSession[]>;
  getConfigurationSessionsByClient(clientId: string): Promise<ConfigurationSession[]>;

  // Client methods
  createClient(insertClient: InsertClient): Promise<Client>;
  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Configuration template methods
  createConfigurationTemplate(insertTemplate: InsertConfigurationTemplate): Promise<ConfigurationTemplate>;
  getConfigurationTemplate(id: string): Promise<ConfigurationTemplate | undefined>;
  getAllConfigurationTemplates(): Promise<ConfigurationTemplate[]>;
  getConfigurationTemplatesByIndustry(industry: string): Promise<ConfigurationTemplate[]>;
  updateConfigurationTemplate(id: string, updates: Partial<ConfigurationTemplate>): Promise<ConfigurationTemplate | undefined>;
  deleteConfigurationTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private configurationSessions: Map<string, ConfigurationSession>;

  constructor() {
    this.users = new Map();
    this.configurationSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createConfigurationSession(
    industry: string,
    status: string,
    clientId?: string
  ): Promise<ConfigurationSession> {
    const id = randomUUID();
    const session: ConfigurationSession = {
      id,
      clientId: clientId || null,
      industry,
      status,
      createdAt: new Date(),
      completedAt: null,
      errorMessage: null,
      generatedConfig: null,
      appliedConfig: null,
    };
    this.configurationSessions.set(id, session);
    return session;
  }

  async getConfigurationSession(
    id: string
  ): Promise<ConfigurationSession | undefined> {
    return this.configurationSessions.get(id);
  }

  async updateConfigurationSession(
    id: string,
    updates: Partial<ConfigurationSession>
  ): Promise<ConfigurationSession | undefined> {
    const session = this.configurationSessions.get(id);
    if (!session) {
      return undefined;
    }

    const updatedSession = { ...session, ...updates };
    this.configurationSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getAllConfigurationSessions(): Promise<ConfigurationSession[]> {
    return Array.from(this.configurationSessions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getConfigurationSessionsByClient(clientId: string): Promise<ConfigurationSession[]> {
    return Array.from(this.configurationSessions.values())
      .filter(session => session.clientId === clientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Client methods (in-memory stubs for MemStorage)
  async createClient(insertClient: InsertClient): Promise<Client> {
    throw new Error("MemStorage does not support client management. Use DbStorage.");
  }

  async getClient(id: string): Promise<Client | undefined> {
    throw new Error("MemStorage does not support client management. Use DbStorage.");
  }

  async getAllClients(): Promise<Client[]> {
    throw new Error("MemStorage does not support client management. Use DbStorage.");
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    throw new Error("MemStorage does not support client management. Use DbStorage.");
  }

  async deleteClient(id: string): Promise<boolean> {
    throw new Error("MemStorage does not support client management. Use DbStorage.");
  }

  // Configuration template methods (in-memory stubs for MemStorage)
  async createConfigurationTemplate(insertTemplate: InsertConfigurationTemplate): Promise<ConfigurationTemplate> {
    throw new Error("MemStorage does not support templates. Use DbStorage.");
  }

  async getConfigurationTemplate(id: string): Promise<ConfigurationTemplate | undefined> {
    throw new Error("MemStorage does not support templates. Use DbStorage.");
  }

  async getAllConfigurationTemplates(): Promise<ConfigurationTemplate[]> {
    throw new Error("MemStorage does not support templates. Use DbStorage.");
  }

  async getConfigurationTemplatesByIndustry(industry: string): Promise<ConfigurationTemplate[]> {
    throw new Error("MemStorage does not support templates. Use DbStorage.");
  }

  async updateConfigurationTemplate(id: string, updates: Partial<ConfigurationTemplate>): Promise<ConfigurationTemplate | undefined> {
    throw new Error("MemStorage does not support templates. Use DbStorage.");
  }

  async deleteConfigurationTemplate(id: string): Promise<boolean> {
    throw new Error("MemStorage does not support templates. Use DbStorage.");
  }
}

// Use DbStorage for PostgreSQL persistence
// MemStorage is kept for testing/development only
import { DbStorage } from "./db-storage";

export const storage = new DbStorage();
