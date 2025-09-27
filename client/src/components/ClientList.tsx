import { useState } from "react";
import ClientCard from "./ClientCard";
import ClientListView from "./ClientListView";
import ClientForm, { type ClientFormData } from "./ClientForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building, Filter, LayoutGrid, List } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Client } from "@shared/schema";

interface ClientListProps {
  clients?: Client[];
  onAddClient?: () => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  editingClient?: Client | null;
  onCancelEdit?: () => void;
}

export default function ClientList({ 
  clients = [], 
  onAddClient,
  onEditClient,
  onDeleteClient,
  editingClient,
  onCancelEdit
}: ClientListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  
  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest('POST', '/api/clients', data);
      if (!response.ok) {
        throw new Error('Failed to create client');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create client",
      });
    },
  });
  
  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      const response = await apiRequest('PUT', `/api/clients/${id}`, data);
      if (!response.ok) {
        throw new Error('Failed to update client');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      onCancelEdit?.();
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update client",
      });
    },
  });

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.address?.toLowerCase().includes(searchLower) ||
      client.leadContact?.toLowerCase().includes(searchLower) ||
      client.leadContactEmail?.toLowerCase().includes(searchLower)
    );
  });

  if (showAddForm || editingClient) {
    const isEditing = !!editingClient;
    const formClient = editingClient ? {
      id: editingClient.id,
      name: editingClient.name,
      address: editingClient.address || undefined,
      leadContact: editingClient.leadContact || undefined,
      leadContactPhone: editingClient.leadContactPhone || undefined,
      leadContactEmail: editingClient.leadContactEmail || undefined,
      extraContacts: editingClient.extraContacts || [],
    } : undefined;
    
    return (
      <div className="space-y-6">
        <ClientForm
          client={formClient}
          isEditing={isEditing}
          onSave={(data) => {
            if (isEditing && editingClient) {
              updateClientMutation.mutate({ id: editingClient.id, data });
            } else {
              createClientMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setShowAddForm(false);
            onCancelEdit?.();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="w-8 h-8" />
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your client organizations and contacts
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(true);
            onAddClient?.();
          }}
          data-testid="button-add-client"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-clients"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
            data-testid="button-view-cards"
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {/* Client Count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" data-testid="badge-client-count">
          {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
        </Badge>
        {searchQuery && (
          <span className="text-sm text-muted-foreground">
            filtered by "{searchQuery}"
          </span>
        )}
      </div>

      {/* Clients Display */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            {searchQuery ? "No clients found" : "No clients yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery 
              ? "Try adjusting your search criteria to find the clients you're looking for."
              : "Start building your client database by adding your first client organization."
            }
          </p>
          {!searchQuery && (
            <Button
              onClick={() => {
                setShowAddForm(true);
                onAddClient?.();
              }}
              data-testid="button-add-first-client"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          )}
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={onEditClient}
              onDelete={onDeleteClient}
            />
          ))}
        </div>
      ) : (
        <ClientListView
          clients={filteredClients}
          onEdit={onEditClient}
          onDelete={onDeleteClient}
        />
      )}
    </div>
  );
}