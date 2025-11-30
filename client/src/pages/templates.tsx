import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil, Trash2, FileText, Globe, Lock } from "lucide-react";
import type { ConfigurationTemplate, GeneratedConfig } from "@shared/schema";
import { industries } from "@/lib/industries";
import { format } from "date-fns";

const templateFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  industry: z.string().min(1, "Le secteur est requis"),
  description: z.string().optional(),
  isPublic: z.enum(["true", "false"]),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

export default function Templates() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ConfigurationTemplate | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      isPublic: "false",
    },
  });

  const { data: templates, isLoading } = useQuery<ConfigurationTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      // Create empty configuration structure
      const emptyConfig: GeneratedConfig = {
        properties: [],
        lists: [],
        workflows: [],
      };

      return await apiRequest("POST", "/api/templates", {
        ...data,
        configuration: emptyConfig,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsCreateDialogOpen(false);
      setEditingTemplate(null);
      form.reset();
      toast({
        title: "Succès",
        description: "Template créé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le template",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TemplateFormValues> }) => {
      return await apiRequest("PUT", `/api/templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setEditingTemplate(null);
      form.reset();
      toast({
        title: "Succès",
        description: "Template modifié avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le template",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/templates/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setDeletingTemplateId(null);
      toast({
        title: "Succès",
        description: "Template supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le template",
        variant: "destructive",
      });
    },
  });

  const handleOpenCreate = () => {
    form.reset();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (template: ConfigurationTemplate) => {
    form.reset({
      name: template.name,
      industry: template.industry,
      description: template.description || "",
      isPublic: template.isPublic as "true" | "false",
    });
    setEditingTemplate(template);
  };

  const handleSubmit = (data: TemplateFormValues) => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getIndustryName = (industryId: string) => {
    const industry = industries.find((i) => i.id === industryId);
    return industry?.name || industryId;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                Templates de Configuration
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos templates de configuration réutilisables
              </p>
            </div>
            <Button onClick={handleOpenCreate} data-testid="button-create-template">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Templates Disponibles</CardTitle>
              <CardDescription>
                {templates?.length || 0} template(s) enregistré(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : templates && templates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Secteur</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Visibilité</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                        <TableCell className="font-medium" data-testid={`text-template-name-${template.id}`}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {template.name}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-template-industry-${template.id}`}>
                          {getIndustryName(template.industry)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {template.description || "Aucune description"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.isPublic === "true" ? "default" : "secondary"} data-testid={`badge-visibility-${template.id}`}>
                            {template.isPublic === "true" ? (
                              <>
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                Privé
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(template.createdAt), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(template)}
                              data-testid={`button-edit-${template.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingTemplateId(template.id)}
                              data-testid={`button-delete-${template.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun template disponible</p>
                  <p className="text-sm mt-1">
                    Créez votre premier template pour démarrer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || editingTemplate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingTemplate(null);
            form.reset();
          }
        }}
      >
        <DialogContent data-testid="dialog-template-form">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Modifier le Template" : "Nouveau Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Modifiez les informations du template"
                : "Créez un nouveau template de configuration vide"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du template</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Mon template personnalisé"
                        data-testid="input-template-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secteur d'activité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-template-industry">
                          <SelectValue placeholder="Sélectionnez un secteur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.id} value={industry.id}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-template-visibility">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">
                          <div className="flex items-center gap-2">
                            <Lock className="h-3 w-3" />
                            Privé (uniquement vous)
                          </div>
                        </SelectItem>
                        <SelectItem value="true">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            Public (visible par tous)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingTemplate(null);
                    form.reset();
                  }}
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-template"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : editingTemplate ? (
                    "Modifier"
                  ) : (
                    "Créer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingTemplateId !== null}
        onOpenChange={(open) => !open && setDeletingTemplateId(null)}
      >
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce template ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTemplateId && handleDelete(deletingTemplateId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
