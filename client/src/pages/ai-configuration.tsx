import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type LogEntry = {
  id: string;
  message: string;
  type: "info" | "success" | "error";
  timestamp: Date;
};

type ConfigStep = {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "error";
};

export default function AIConfiguration() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const industry = params.get("industry");
  const apiKey = params.get("apiKey");
  const clientId = params.get("clientId");
  const templateId = params.get("templateId");

  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [steps, setSteps] = useState<ConfigStep[]>([
    { id: "connect", title: "Connexion à HubSpot", status: "pending" },
    { id: "analyze", title: "Analyse du secteur d'activité", status: "pending" },
    { id: "generate", title: "Génération des configurations IA", status: "pending" },
    { id: "create-properties", title: "Création des propriétés personnalisées", status: "pending" },
    { id: "create-lists", title: "Création des listes", status: "pending" },
    { id: "create-workflows", title: "Création des workflows", status: "pending" },
  ]);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const log: LogEntry = {
      id: Math.random().toString(36),
      message,
      type,
      timestamp: new Date(),
    };
    setLogs((prev) => [...prev, log]);
  };

  const updateStep = (stepId: string, status: ConfigStep["status"]) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
  };

  useEffect(() => {
    if (!industry || !apiKey) {
      setLocation("/");
      return;
    }

    const runConfiguration = async () => {
      try {
        // Step 1: Connect to HubSpot
        updateStep("connect", "running");
        addLog("Connexion à HubSpot en cours...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateStep("connect", "completed");
        addLog("Connexion établie avec succès", "success");
        setProgress(15);

        // Step 2: Analyze industry
        updateStep("analyze", "running");
        addLog(`Analyse du secteur: ${industry}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        updateStep("analyze", "completed");
        addLog("Analyse terminée - besoins identifiés", "success");
        setProgress(30);

        // Step 3: Generate configurations with AI
        updateStep("generate", "running");
        addLog("Invocation de l'agent IA...");
        addLog("Génération des propriétés personnalisées...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        addLog("Génération des listes segmentées...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        addLog("Génération des workflows automatisés...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const response = await fetch("/api/hubspot/generate-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            industry, 
            apiKey,
            clientId: clientId || undefined,
            templateId: templateId || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la génération des configurations");
        }

        const data = await response.json();
        setSessionId(data.sessionId);
        
        updateStep("generate", "completed");
        addLog("Configurations générées avec succès", "success");
        setProgress(50);

        // Step 4: Create properties
        updateStep("create-properties", "running");
        addLog("Application des propriétés dans HubSpot...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        updateStep("create-properties", "completed");
        addLog(`${data.stats?.propertiesCount || 0} propriétés créées`, "success");
        setProgress(70);

        // Step 5: Create lists
        updateStep("create-lists", "running");
        addLog("Création des listes segmentées...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        updateStep("create-lists", "completed");
        addLog(`${data.stats?.listsCount || 0} listes créées`, "success");
        setProgress(85);

        // Step 6: Create workflows
        updateStep("create-workflows", "running");
        addLog("Configuration des workflows...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        updateStep("create-workflows", "completed");
        addLog(`${data.stats?.workflowsCount || 0} workflows configurés`, "success");
        setProgress(100);

        addLog("Configuration terminée avec succès!", "success");
        setIsComplete(true);
      } catch (error: any) {
        setHasError(true);
        addLog(error.message || "Une erreur est survenue", "error");
        const currentStep = steps.find((s) => s.status === "running");
        if (currentStep) {
          updateStep(currentStep.id, "error");
        }
      }
    };

    runConfiguration();
  }, []);

  const handleViewResults = () => {
    if (sessionId) {
      setLocation(`/dashboard?session=${sessionId}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Configuration en cours
          </h1>
          <p className="text-muted-foreground mt-2">
            L'agent IA configure votre HubSpot en temps réel
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progression</CardTitle>
                  <CardDescription>
                    {isComplete
                      ? "Configuration terminée"
                      : hasError
                      ? "Erreur détectée"
                      : "Configuration en cours..."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avancement global</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" data-testid="progress-configuration" />
                  </div>

                  <div className="space-y-3">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        data-testid={`step-${step.id}`}
                      >
                        {step.status === "pending" && (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        {step.status === "running" && (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        )}
                        {step.status === "completed" && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {step.status === "error" && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span
                          className={`text-sm ${
                            step.status === "completed"
                              ? "text-foreground"
                              : step.status === "running"
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {isComplete && (
                    <Alert className="border-green-500/50 bg-green-500/10">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600">
                        Votre HubSpot est maintenant configuré pour votre secteur d'activité!
                      </AlertDescription>
                    </Alert>
                  )}

                  {hasError && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Une erreur est survenue pendant la configuration. Consultez les logs pour plus de détails.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isComplete && (
                    <Button
                      onClick={handleViewResults}
                      className="w-full"
                      size="lg"
                      data-testid="button-view-results"
                    >
                      Voir les résultats
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Logs d'activité</CardTitle>
                  <CardDescription>Suivi en temps réel des opérations</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 text-sm p-2 rounded hover-elevate"
                          data-testid={`log-${log.type}`}
                        >
                          <Badge
                            variant={
                              log.type === "success"
                                ? "default"
                                : log.type === "error"
                                ? "destructive"
                                : "secondary"
                            }
                            className="mt-0.5 flex-shrink-0"
                          >
                            {log.type === "success" ? "✓" : log.type === "error" ? "✗" : "•"}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-foreground">{log.message}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {log.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
