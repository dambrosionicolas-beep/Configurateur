import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle2, List, Settings, Workflow, Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const saveTemplateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

type SaveTemplateFormValues = z.infer<typeof saveTemplateSchema>;

export default function ConfigurationDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(location.split("?")[1]);
  const sessionId = params.get("session");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const form = useForm<SaveTemplateFormValues>({
    resolver: zodResolver(saveTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { data: configuration, isLoading } = useQuery<any>({
    queryKey: ["/api/configurations", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/configurations/${sessionId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!sessionId,
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (data: SaveTemplateFormValues) => {
      if (!configuration?.generatedConfig) {
        throw new Error("Aucune configuration à sauvegarder");
      }

      return await apiRequest("POST", "/api/templates", {
        name: data.name,
        description: data.description || "",
        industry: configuration.industry,
        configuration: configuration.generatedConfig,
        isPublic: "false",
      });
    },
    onSuccess: () => {
      toast({
        title: "Template créé",
        description: "Votre configuration a été sauvegardée comme template",
      });
      setIsSaveDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le template",
        variant: "destructive",
      });
    },
  });

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Session non trouvée</CardTitle>
            <CardDescription>
              Aucune session de configuration n'a été spécifiée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Nouvelle configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-5 w-[500px] mt-2" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const appliedConfig = configuration?.appliedConfig || {
    properties: [],
    lists: [],
    workflows: [],
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                Configuration terminée
              </h1>
              <p className="text-muted-foreground mt-2">
                Votre HubSpot a été configuré avec succès pour le secteur{" "}
                <span className="font-medium text-foreground">{configuration?.industry}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSaveDialogOpen(true)}
                data-testid="button-save-template"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder comme template
              </Button>
              <Button onClick={() => setLocation("/")} data-testid="button-new-config">
                Nouvelle configuration
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card data-testid="card-stats-properties">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Propriétés créées</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{appliedConfig.properties.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Champs personnalisés dans HubSpot
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stats-lists">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listes créées</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{appliedConfig.lists.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Segmentations automatiques
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stats-workflows">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workflows créés</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{appliedConfig.workflows.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatisations configurées
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détails de la configuration</CardTitle>
              <CardDescription>
                Éléments créés et configurés dans votre HubSpot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full" defaultValue={["properties"]}>
                <AccordionItem value="properties">
                  <AccordionTrigger data-testid="accordion-properties">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span>Propriétés personnalisées</span>
                      <Badge variant="secondary">{appliedConfig.properties.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-4">
                      {appliedConfig.properties.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucune propriété créée
                        </p>
                      ) : (
                        appliedConfig.properties.map((prop: any) => (
                          <div
                            key={prop.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            data-testid={`property-${prop.id}`}
                          >
                            <div>
                              <p className="font-medium text-sm">{prop.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {prop.name}
                              </p>
                            </div>
                            <Badge variant="outline">Actif</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="lists">
                  <AccordionTrigger data-testid="accordion-lists">
                    <div className="flex items-center gap-3">
                      <List className="h-5 w-5 text-primary" />
                      <span>Listes segmentées</span>
                      <Badge variant="secondary">{appliedConfig.lists.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-4">
                      {appliedConfig.lists.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucune liste créée
                        </p>
                      ) : (
                        appliedConfig.lists.map((list: any) => (
                          <div
                            key={list.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            data-testid={`list-${list.id}`}
                          >
                            <div>
                              <p className="font-medium text-sm">{list.name}</p>
                            </div>
                            <Badge variant="outline">Actif</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="workflows">
                  <AccordionTrigger data-testid="accordion-workflows">
                    <div className="flex items-center gap-3">
                      <Workflow className="h-5 w-5 text-primary" />
                      <span>Workflows automatisés</span>
                      <Badge variant="secondary">{appliedConfig.workflows.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-4">
                      {appliedConfig.workflows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucun workflow créé
                        </p>
                      ) : (
                        appliedConfig.workflows.map((workflow: any) => (
                          <div
                            key={workflow.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            data-testid={`workflow-${workflow.id}`}
                          >
                            <div>
                              <p className="font-medium text-sm">{workflow.name}</p>
                            </div>
                            <Badge variant="outline">Configuré</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save as Template Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent data-testid="dialog-save-template">
          <DialogHeader>
            <DialogTitle>Sauvegarder comme template</DialogTitle>
            <DialogDescription>
              Enregistrez cette configuration pour la réutiliser plus tard
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveTemplateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du template</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Template immobilier personnalisé"
                        data-testid="input-template-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnelle)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Décrivez l'utilisation de ce template..."
                        rows={3}
                        data-testid="input-template-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSaveDialogOpen(false)}
                  data-testid="button-cancel-save"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saveTemplateMutation.isPending}
                  data-testid="button-confirm-save"
                >
                  {saveTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
