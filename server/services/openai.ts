import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry from "p-retry";
import type { GeneratedConfig } from "@shared/schema";

// Lazy-load OpenAI client to allow server to start without API key
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

export async function generateConfigurationForIndustry(
  industry: string
): Promise<GeneratedConfig> {
  const prompt = `Tu es un expert en CRM et HubSpot. Génère une configuration HubSpot personnalisée pour le secteur d'activité suivant : "${industry}".

La configuration doit inclure :

1. **Properties (Propriétés personnalisées)** : Crée 8-12 propriétés pertinentes pour ce secteur.
   - Chaque propriété doit avoir : name (snake_case), label, type (string|number|date|enumeration), fieldType (text|textarea|number|date|select|radio), groupName, description
   - Pour les énumérations, ajoute un tableau options avec label et value
   
2. **Lists (Listes segmentées)** : Crée 4-6 listes pour segmenter les contacts/entreprises.
   - Chaque liste doit avoir : name, processingType ("MANUAL" ou "DYNAMIC"), filterGroups (peut être vide pour l'instant)

3. **Workflows (Automatisations)** : Crée 3-5 workflows pour automatiser les processus.
   - Chaque workflow doit avoir : name, type ("CONTACT" ou "COMPANY"), enabled (true), actions (tableau vide pour l'instant), triggers (tableau vide pour l'instant)

Réponds UNIQUEMENT avec un objet JSON valide au format :
{
  "properties": [...],
  "lists": [...],
  "workflows": [...]
}

Sois créatif et pertinent pour le secteur "${industry}". Les noms doivent être en français.`;

  try {
    const response = await pRetry(
      async () => {
        try {
          const openai = getOpenAIClient();
          const completion = await openai.chat.completions.create({
            model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
            messages: [
              {
                role: "system",
                content:
                  "Tu es un expert en CRM HubSpot. Tu réponds UNIQUEMENT avec du JSON valide, sans texte explicatif.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 8192,
          });

          const content = completion.choices[0]?.message?.content;
          if (!content) {
            throw new Error("Aucune réponse de l'IA");
          }

          return JSON.parse(content) as GeneratedConfig;
        } catch (error: any) {
          if (isRateLimitError(error)) {
            throw error;
          }
          // For non-rate-limit errors, don't retry
          const abortError: any = new Error(error.message);
          abortError.name = "AbortError";
          throw abortError;
        }
      },
      {
        retries: 7,
        minTimeout: 2000,
        maxTimeout: 128000,
        factor: 2,
      }
    );

    // Validate the response structure
    if (!response.properties || !response.lists || !response.workflows) {
      throw new Error("Format de réponse IA invalide");
    }

    return response;
  } catch (error: any) {
    console.error("Erreur lors de la génération de configuration IA:", error);
    throw new Error(
      `Impossible de générer la configuration : ${error.message}`
    );
  }
}
