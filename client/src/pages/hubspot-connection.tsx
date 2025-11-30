import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Client, ConfigurationTemplate } from "@shared/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label as RadixLabel } from "@/components/ui/label";

export default function HubSpotConnection() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const params = new URLSearchParams(location.split("?")[1]);
  const industry = params.get("industry");

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: templates } = useQuery<ConfigurationTemplate[]>({
    queryKey: ["/api/templates/by-industry", industry],
    queryFn: async () => {
      if (!industry) return [];
      const response = await fetch(`/api/templates/by-industry/${industry}`, {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!industry,
  });

  // Redirect if industry is missing (use useEffect to avoid render-time navigation)
  useEffect(() => {
    if (!industry) {
      setLocation("/");
    }
  }, [industry, setLocation]);

  if (!industry) {
    return null;
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une clé API",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/hubspot/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestStatus("success");
        toast({
          title: "Connexion réussie",
          description: "Votre clé API HubSpot est valide",
        });
      } else {
        setTestStatus("error");
        setErrorMessage(data.message || "Erreur de connexion");
        toast({
          title: "Erreur de connexion",
          description: data.message || "Vérifiez votre clé API",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestStatus("error");
      setErrorMessage("Erreur réseau");
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au serveur",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleContinue = () => {
    if (testStatus === "success") {
      const params = new URLSearchParams({
        industry: industry || "",
        apiKey: apiKey,
      });
      if (selectedClientId) {
        params.append("clientId", selectedClientId);
      }
      if (selectedTemplateId) {
        params.append("templateId", selectedTemplateId);
      }
      setLocation(`/configure?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-semibold text-foreground">
            Connexion à HubSpot
          </h1>
          <p className="text-muted-foreground mt-2">
            Connectez votre compte HubSpot avec une clé API d'application privée
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Clé API HubSpot</CardTitle>
              <CardDescription>
                Créez une application privée dans HubSpot et copiez la clé API ici.
                Votre clé est cryptée et n'est jamais stockée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm font-medium">
                    Clé API
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="font-mono pr-10"
                      data-testid="input-api-key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-api-key"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format : pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                  </p>
                </div>

                {clients && clients.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="client" className="text-sm font-medium">
                      Client (optionnel)
                    </Label>
                    <Select
                      value={selectedClientId}
                      onValueChange={setSelectedClientId}
                    >
                      <SelectTrigger data-testid="select-client">
                        <SelectValue placeholder="Aucun client sélectionné" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun client</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Associez cette configuration à un client pour un meilleur suivi
                    </p>
                  </div>
                )}

                {templates && templates.length > 0 && (
                  <div className="space-y-3 pt-2 border-t">
                    <Label className="text-sm font-medium">
                      Mode de génération
                    </Label>
                    <RadioGroup
                      value={selectedTemplateId}
                      onValueChange={setSelectedTemplateId}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="mode-ai" data-testid="radio-mode-ai" />
                        <RadixLabel htmlFor="mode-ai" className="text-sm cursor-pointer flex-1">
                          <div>
                            <div className="font-medium">Générer avec l'IA</div>
                            <div className="text-xs text-muted-foreground">
                              Configuration personnalisée générée automatiquement
                            </div>
                          </div>
                        </RadixLabel>
                      </div>
                      {templates.map((template) => (
                        <div key={template.id} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={template.id}
                            id={`template-${template.id}`}
                            data-testid={`radio-template-${template.id}`}
                          />
                          <RadixLabel
                            htmlFor={`template-${template.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {template.name}
                                {template.isPublic === "true" && (
                                  <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                    Public
                                  </span>
                                )}
                              </div>
                              {template.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {template.description}
                                </div>
                              )}
                            </div>
                          </RadixLabel>
                        </div>
                      ))}
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Choisissez un template pré-configuré ou laissez l'IA générer une configuration personnalisée
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                  className="w-full"
                  variant={testStatus === "success" ? "default" : "outline"}
                  data-testid="button-test-connection"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Test en cours...
                    </>
                  ) : testStatus === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Connexion réussie
                    </>
                  ) : (
                    "Tester la connexion"
                  )}
                </Button>

                {testStatus === "success" && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Votre clé API est valide et la connexion à HubSpot fonctionne correctement.
                    </AlertDescription>
                  </Alert>
                )}

                {testStatus === "error" && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errorMessage || "Impossible de se connecter à HubSpot. Vérifiez votre clé API."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/")}
                    data-testid="button-back"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={testStatus !== "success"}
                    size="lg"
                    data-testid="button-continue"
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Comment obtenir une clé API ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Connectez-vous à votre compte HubSpot</p>
              <p>2. Allez dans Paramètres → Intégrations → Applications privées</p>
              <p>3. Créez une nouvelle application privée</p>
              <p>4. Donnez les permissions nécessaires (CRM: contacts, companies, deals)</p>
              <p>5. Copiez la clé API générée</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
