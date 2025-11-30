import type { Express} from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { industries } from "../client/src/lib/industries";
import { generateConfigurationForIndustry } from "./services/openai";
import { createHubSpotClient } from "./services/hubspot";
import { insertClientSchema, insertConfigurationTemplateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/industries - Get list of available industries
  app.get("/api/industries", async (req, res) => {
    try {
      res.json(industries);
    } catch (error: any) {
      console.error("Error fetching industries:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des secteurs" });
    }
  });

  // POST /api/hubspot/test-connection - Test HubSpot API key connection
  app.post("/api/hubspot/test-connection", async (req, res) => {
    try {
      const schema = z.object({
        apiKey: z.string().min(10),
      });

      const { apiKey } = schema.parse(req.body);
      const hubspot = createHubSpotClient(apiKey);

      await hubspot.testConnection();

      res.json({
        success: true,
        message: "Connexion HubSpot réussie",
      });
    } catch (error: any) {
      console.error("Error testing HubSpot connection:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Impossible de se connecter à HubSpot",
      });
    }
  });

  // POST /api/hubspot/generate-config - Generate and apply configuration
  app.post("/api/hubspot/generate-config", async (req, res) => {
    try {
      const schema = z.object({
        industry: z.string().min(1),
        apiKey: z.string().min(10),
        clientId: z.string().optional(),
        templateId: z.string().optional(),
      });

      const { industry, apiKey, clientId, templateId } = schema.parse(req.body);

      // Create configuration session (API key NOT stored, only used during request)
      const session = await storage.createConfigurationSession(
        industry,
        "generating",
        clientId
      );

      // Generate or load configuration
      let generatedConfig;
      try {
        if (templateId) {
          // Use template configuration instead of AI generation
          const template = await storage.getConfigurationTemplate(templateId);
          if (!template) {
            throw new Error("Template introuvable");
          }
          generatedConfig = template.configuration;
        } else {
          // Generate configuration with AI
          generatedConfig = await generateConfigurationForIndustry(industry);
        }

        // Update session with generated config
        await storage.updateConfigurationSession(session.id, {
          status: "applying",
          generatedConfig,
        });
      } catch (error: any) {
        await storage.updateConfigurationSession(session.id, {
          status: "error",
          errorMessage: error.message,
        });
        throw error;
      }

      // Apply configuration to HubSpot
      try {
        const hubspot = createHubSpotClient(apiKey);
        const appliedConfig = await hubspot.applyConfiguration(
          generatedConfig.properties,
          generatedConfig.lists,
          generatedConfig.workflows
        );

        // Update session as completed
        await storage.updateConfigurationSession(session.id, {
          status: "completed",
          completedAt: new Date(),
          appliedConfig,
        });

        res.json({
          success: true,
          sessionId: session.id,
          stats: {
            propertiesCount: appliedConfig.properties.length,
            listsCount: appliedConfig.lists.length,
            workflowsCount: appliedConfig.workflows.length,
          },
        });
      } catch (error: any) {
        await storage.updateConfigurationSession(session.id, {
          status: "error",
          errorMessage: error.message,
        });
        throw error;
      }
    } catch (error: any) {
      console.error("Error generating configuration:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de la génération de la configuration",
      });
    }
  });

  // ====================
  // CLIENT MANAGEMENT ROUTES
  // ====================

  // POST /api/clients - Create a new client
  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error: any) {
      console.error("Error creating client:", error);
      res.status(400).json({
        message: error.message || "Erreur lors de la création du client",
      });
    }
  });

  // GET /api/clients - Get all clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération des clients",
      });
    }
  });

  // GET /api/clients/:id - Get a specific client
  app.get("/api/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);

      if (!client) {
        res.status(404).json({ message: "Client non trouvé" });
        return;
      }

      res.json(client);
    } catch (error: any) {
      console.error("Error fetching client:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération du client",
      });
    }
  });

  // PUT /api/clients/:id - Update a client
  app.put("/api/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, updates);

      if (!client) {
        res.status(404).json({ message: "Client non trouvé" });
        return;
      }

      res.json(client);
    } catch (error: any) {
      console.error("Error updating client:", error);
      res.status(400).json({
        message: error.message || "Erreur lors de la mise à jour du client",
      });
    }
  });

  // DELETE /api/clients/:id - Delete a client
  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteClient(id);

      if (!success) {
        res.status(404).json({ message: "Client non trouvé" });
        return;
      }

      res.json({ success: true, message: "Client supprimé avec succès" });
    } catch (error: any) {
      console.error("Error deleting client:", error);
      res.status(500).json({
        message: "Erreur lors de la suppression du client",
      });
    }
  });

  // GET /api/clients/:id/configurations - Get all configurations for a client
  app.get("/api/clients/:id/configurations", async (req, res) => {
    try {
      const { id } = req.params;
      const configurations = await storage.getConfigurationSessionsByClient(id);
      res.json(configurations);
    } catch (error: any) {
      console.error("Error fetching client configurations:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération de l'historique du client",
      });
    }
  });

  // ========================
  // CONFIGURATION TEMPLATES
  // ========================

  // POST /api/templates/seed - Seed public templates for all industries
  app.post("/api/templates/seed", async (req, res) => {
    try {
      const publicTemplates = [
        {
          name: "Template Immobilier Standard",
          industry: "real-estate",
          description: "Configuration standard pour agents immobiliers avec gestion de biens, leads et rendez-vous",
          isPublic: "true" as const,
          configuration: {
            properties: [
              { name: "property_type", label: "Type de bien", type: "string", fieldType: "select", groupName: "Informations du bien", options: [{ label: "Appartement", value: "apartment" }, { label: "Maison", value: "house" }, { label: "Terrain", value: "land" }] },
              { name: "property_price", label: "Prix", type: "number", fieldType: "number", groupName: "Informations du bien" },
              { name: "property_surface", label: "Surface (m²)", type: "number", fieldType: "number", groupName: "Informations du bien" },
            ],
            lists: [
              { name: "Leads Actifs", processingType: "DYNAMIC", filterGroups: [] },
              { name: "Biens Disponibles", processingType: "DYNAMIC", filterGroups: [] },
            ],
            workflows: [
              { name: "Relance Leads", type: "CONTACT_BASED", enabled: true, actions: [], triggers: [] },
            ],
          },
        },
        {
          name: "Template E-commerce Standard",
          industry: "ecommerce",
          description: "Configuration standard pour boutiques en ligne avec gestion de commandes et clients",
          isPublic: "true" as const,
          configuration: {
            properties: [
              { name: "customer_ltv", label: "Valeur à vie client", type: "number", fieldType: "number", groupName: "Métriques client" },
              { name: "last_purchase_date", label: "Dernière commande", type: "datetime", fieldType: "date", groupName: "Historique" },
              { name: "preferred_category", label: "Catégorie préférée", type: "string", fieldType: "text", groupName: "Préférences" },
            ],
            lists: [
              { name: "Clients VIP", processingType: "DYNAMIC", filterGroups: [] },
              { name: "Paniers Abandonnés", processingType: "DYNAMIC", filterGroups: [] },
            ],
            workflows: [
              { name: "Récupération Panier Abandonné", type: "CONTACT_BASED", enabled: true, actions: [], triggers: [] },
            ],
          },
        },
      ];

      const created = [];
      for (const template of publicTemplates) {
        const existing = await storage.getConfigurationTemplatesByIndustry(template.industry);
        const alreadyExists = existing.some(t => t.name === template.name && t.isPublic === "true");
        
        if (!alreadyExists) {
          const result = await storage.createConfigurationTemplate(template);
          created.push(result);
        }
      }

      res.json({
        success: true,
        message: `${created.length} templates publics créés`,
        created,
      });
    } catch (error: any) {
      console.error("Error seeding templates:", error);
      res.status(500).json({
        message: "Erreur lors du seeding des templates",
      });
    }
  });

  // POST /api/templates - Create a new template
  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertConfigurationTemplateSchema.parse(req.body);
      const template = await storage.createConfigurationTemplate(templateData);
      res.json(template);
    } catch (error: any) {
      console.error("Error creating template:", error);
      res.status(400).json({
        message: error.message || "Erreur lors de la création du template",
      });
    }
  });

  // GET /api/templates - Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllConfigurationTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération des templates",
      });
    }
  });

  // GET /api/templates/:id - Get template by ID
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getConfigurationTemplate(id);

      if (!template) {
        res.status(404).json({ message: "Template non trouvé" });
        return;
      }

      res.json(template);
    } catch (error: any) {
      console.error("Error fetching template:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération du template",
      });
    }
  });

  // GET /api/templates/by-industry/:industry - Get templates by industry
  app.get("/api/templates/by-industry/:industry", async (req, res) => {
    try {
      const { industry } = req.params;
      const templates = await storage.getConfigurationTemplatesByIndustry(industry);
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching templates by industry:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération des templates par secteur",
      });
    }
  });

  // PUT /api/templates/:id - Update a template
  app.put("/api/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertConfigurationTemplateSchema.partial().parse(req.body);
      const template = await storage.updateConfigurationTemplate(id, updates);

      if (!template) {
        res.status(404).json({ message: "Template non trouvé" });
        return;
      }

      res.json(template);
    } catch (error: any) {
      console.error("Error updating template:", error);
      res.status(400).json({
        message: error.message || "Erreur lors de la mise à jour du template",
      });
    }
  });

  // DELETE /api/templates/:id - Delete a template
  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteConfigurationTemplate(id);

      if (!success) {
        res.status(404).json({ message: "Template non trouvé" });
        return;
      }

      res.json({ success: true, message: "Template supprimé avec succès" });
    } catch (error: any) {
      console.error("Error deleting template:", error);
      res.status(500).json({
        message: "Erreur lors de la suppression du template",
      });
    }
  });

  // ====================
  // CONFIGURATION ROUTES
  // ====================

  // GET /api/configurations/:id - Get configuration session by ID (API key redacted)
  app.get("/api/configurations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getConfigurationSession(id);

      if (!session) {
        res.status(404).json({ message: "Session de configuration non trouvée" });
        return;
      }

      // API key is already redacted by storage layer
      res.json(session);
    } catch (error: any) {
      console.error("Error fetching configuration:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération de la configuration",
      });
    }
  });

  // GET /api/configurations - Get all configuration sessions
  app.get("/api/configurations", async (req, res) => {
    try {
      const sessions = await storage.getAllConfigurationSessions();
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching configurations:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération des configurations",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
