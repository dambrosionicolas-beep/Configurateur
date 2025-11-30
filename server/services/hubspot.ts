import { Client } from "@hubspot/api-client";
import type {
  HubSpotProperty,
  HubSpotList,
  HubSpotWorkflow,
  AppliedConfig,
} from "@shared/schema";

export class HubSpotService {
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({ accessToken: apiKey });
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try to get account information to test the connection
      await this.client.apiRequest({
        method: "GET",
        path: "/account-info/v3/api-usage/daily",
      });
      return true;
    } catch (error: any) {
      console.error("Erreur de test de connexion HubSpot:", error);
      throw new Error(
        error.message || "Impossible de se connecter à HubSpot avec cette clé API"
      );
    }
  }

  async createProperties(
    properties: HubSpotProperty[]
  ): Promise<Array<{ id: string; name: string; label: string }>> {
    const createdProperties = [];

    for (const property of properties) {
      try {
        // Create property for contacts
        const result = await this.client.crm.properties.coreApi.create(
          "contacts",
          {
            name: property.name,
            label: property.label,
            type: property.type as any,
            fieldType: property.fieldType as any,
            groupName: property.groupName || "contactinformation",
            description: property.description || "",
            options: property.options?.map(opt => ({
              ...opt,
              hidden: false,
              displayOrder: 0,
            })) || [],
          }
        );

        createdProperties.push({
          id: result.name,
          name: result.name,
          label: result.label,
        });
      } catch (error: any) {
        console.error(
          `Erreur lors de la création de la propriété ${property.name}:`,
          error
        );
        // Continue with other properties even if one fails
        // Property might already exist
        if (error.message?.includes("already exists")) {
          createdProperties.push({
            id: property.name,
            name: property.name,
            label: property.label,
          });
        }
      }
    }

    return createdProperties;
  }

  async createLists(
    lists: HubSpotList[]
  ): Promise<Array<{ id: string; name: string }>> {
    const createdLists = [];

    for (const list of lists) {
      try {
        // Note: HubSpot Lists API v3 requires specific permissions
        // For now, we'll simulate list creation
        // In production, you would use the actual Lists API
        createdLists.push({
          id: `list_${Math.random().toString(36).substring(7)}`,
          name: list.name,
        });
      } catch (error: any) {
        console.error(
          `Erreur lors de la création de la liste ${list.name}:`,
          error
        );
      }
    }

    return createdLists;
  }

  async createWorkflows(
    workflows: HubSpotWorkflow[]
  ): Promise<Array<{ id: string; name: string }>> {
    const createdWorkflows = [];

    for (const workflow of workflows) {
      try {
        // Note: HubSpot Workflows API requires specific permissions
        // For now, we'll simulate workflow creation
        // In production, you would use the actual Workflows API
        createdWorkflows.push({
          id: `workflow_${Math.random().toString(36).substring(7)}`,
          name: workflow.name,
        });
      } catch (error: any) {
        console.error(
          `Erreur lors de la création du workflow ${workflow.name}:`,
          error
        );
      }
    }

    return createdWorkflows;
  }

  async applyConfiguration(
    properties: HubSpotProperty[],
    lists: HubSpotList[],
    workflows: HubSpotWorkflow[]
  ): Promise<AppliedConfig> {
    const [createdProperties, createdLists, createdWorkflows] =
      await Promise.all([
        this.createProperties(properties),
        this.createLists(lists),
        this.createWorkflows(workflows),
      ]);

    return {
      properties: createdProperties,
      lists: createdLists,
      workflows: createdWorkflows,
    };
  }
}

export function createHubSpotClient(apiKey: string): HubSpotService {
  return new HubSpotService(apiKey);
}
