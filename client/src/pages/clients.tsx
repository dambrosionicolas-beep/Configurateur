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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type Client } from "@shared/schema";
import { z } from "zod";
import { Plus, Pencil, Trash2, History } from "lucide-react";
import { industries } from "@/lib/industries";
import { Badge } from "@/components/ui/badge";
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

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "Le nom est requis"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function Clients() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Client | null>(null);

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: clientHistory } = useQuery({
    queryKey: ["/api/clients", viewingHistory?.id, "configurations"],
    queryFn: async () => {
      if (!viewingHistory) return [];
      const response = await fetch(
        `/api/clients/${viewingHistory.id}/configurations`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch client history");
      return response.json();
    },
    enabled: !!viewingHistory,
  });

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      primaryIndustry: "",
      metadata: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      return await apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client créé",
        description: "Le client a été créé avec succès",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ClientFormValues>;
    }) => {
      return await apiRequest("PUT", `/api/clients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès",
      });
      setEditingClient(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/clients/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
      setDeletingClient(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenCreate = () => {
    form.reset();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    form.reset({
      name: client.name,
      email: client.email || "",
      primaryIndustry: client.primaryIndustry || "",
      metadata: client.metadata as any,
    });
    setEditingClient(client);
  };

  const handleSubmit = (data: ClientFormValues) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (deletingClient) {
      deleteMutation.mutate(deletingClient.id);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto py-8 px-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold" data-testid="text-page-title">
              Gestion des Clients
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos clients et consultez leur historique de configurations
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            size="default"
            data-testid="button-create-client"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Clients</CardTitle>
            <CardDescription>
              {clients?.length || 0} client(s) enregistré(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-testid="text-loading"
              >
                Chargement...
              </div>
            ) : clients && clients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Secteur Principal</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow
                      key={client.id}
                      data-testid={`row-client-${client.id}`}
                    >
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell>
                        {client.primaryIndustry ? (
                          <Badge variant="secondary">
                            {industries.find((i) => i.id === client.primaryIndustry)?.name || client.primaryIndustry}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setViewingHistory(client)}
                          data-testid={`button-history-${client.id}`}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(client)}
                          data-testid={`button-edit-${client.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingClient(client)}
                          data-testid={`button-delete-${client.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div
                className="text-center py-12 text-muted-foreground"
                data-testid="text-empty-state"
              >
                <p className="text-lg mb-2">Aucun client enregistré</p>
                <p className="text-sm">
                  Créez votre premier client pour commencer
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingClient}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingClient(null);
              form.reset();
            }
          }}
        >
          <DialogContent data-testid="dialog-client-form">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Modifier le Client" : "Nouveau Client"}
              </DialogTitle>
              <DialogDescription>
                {editingClient
                  ? "Modifiez les informations du client"
                  : "Créez un nouveau client pour gérer ses configurations"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du Client</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Acme Corporation"
                          data-testid="input-client-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          type="email"
                          placeholder="contact@acme.com"
                          data-testid="input-client-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primaryIndustry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteur Principal (optionnel)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-client-industry">
                            <SelectValue placeholder="Sélectionner un secteur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem
                              key={industry.id}
                              value={industry.id}
                            >
                              {industry.name}
                            </SelectItem>
                          ))}
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
                      setEditingClient(null);
                      form.reset();
                    }}
                    data-testid="button-cancel-client-form"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    data-testid="button-submit-client-form"
                  >
                    {editingClient ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingClient}
          onOpenChange={(open) => !open && setDeletingClient(null)}
        >
          <AlertDialogContent data-testid="dialog-delete-client">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le client{" "}
                <strong>{deletingClient?.name}</strong> ? Cette action est
                irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                data-testid="button-confirm-delete"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* History Dialog */}
        <Dialog
          open={!!viewingHistory}
          onOpenChange={(open) => !open && setViewingHistory(null)}
        >
          <DialogContent className="max-w-4xl" data-testid="dialog-client-history">
            <DialogHeader>
              <DialogTitle>
                Historique - {viewingHistory?.name}
              </DialogTitle>
              <DialogDescription>
                Configurations créées pour ce client
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-auto">
              {clientHistory && clientHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Secteur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Résultats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientHistory.map((config: any) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <Badge variant="secondary">
                            {industries.find((i) => i.id === config.industry)
                              ?.name || config.industry}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              config.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {config.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(config.createdAt).toLocaleString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          {config.appliedConfig
                            ? `${config.appliedConfig.properties?.length || 0} props, ${config.appliedConfig.lists?.length || 0} listes, ${config.appliedConfig.workflows?.length || 0} workflows`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune configuration pour ce client
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
