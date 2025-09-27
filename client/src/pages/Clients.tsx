import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ClientList from "@/components/ClientList";
import type { Client } from "@shared/schema";

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Fetch clients
  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    queryFn: async (): Promise<Client[]> => {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await apiRequest('DELETE', `/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete client",
      });
    },
  });

  const handleAddClient = () => {
    // This will be handled by the ClientList component
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      deleteClientMutation.mutate(clientId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium text-destructive mb-2">Error loading clients</h3>
        <p className="text-muted-foreground">There was a problem loading your clients. Please try again.</p>
      </div>
    );
  }

  return (
    <ClientList
      clients={clients}
      onAddClient={handleAddClient}
      onEditClient={handleEditClient}
      onDeleteClient={handleDeleteClient}
      editingClient={editingClient}
      onCancelEdit={() => setEditingClient(null)}
    />
  );
}