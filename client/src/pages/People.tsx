import PersonList from "@/components/PersonList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Person as DbPerson } from "@shared/schema";

// Frontend Person interface (for components)
interface Person {
  id: string;
  name: string;
  email?: string;
  telephone?: string;
  address?: string;
  jobs?: Array<{
    id: string;
    title: string;
    status: string;
    clientName?: string;
  }>;
}

// Convert database person to frontend person
function dbPersonToFrontend(dbPerson: DbPerson): Person {
  return {
    id: dbPerson.id,
    name: dbPerson.name,
    email: dbPerson.email || undefined,
    telephone: dbPerson.telephone || undefined,
    address: dbPerson.address || undefined,
    jobs: [], // TODO: Add jobs once jobs API is ready
  };
}
import { useToast } from "@/hooks/use-toast";

export default function People() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPerson, setEditingPerson] = useState<DbPerson | null>(null);

  // Fetch all people
  const { data: dbPeople = [], isLoading } = useQuery<DbPerson[]>({
    queryKey: ['/api/people'],
  });
  
  // Convert database people to frontend format
  const people = dbPeople.map(dbPersonToFrontend);

  // Delete person mutation
  const deleteMutation = useMutation({
    mutationFn: async (personId: string) => {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete person');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      toast({
        title: "Success",
        description: "Person deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete person",
      });
    },
  });

  const handleAddPerson = () => {
    setEditingPerson(null);
  };

  const handleEditPerson = (person: Person) => {
    // Convert frontend person back to db format for editing
    const dbPerson: DbPerson = {
      id: person.id,
      name: person.name,
      email: person.email || null,
      telephone: person.telephone || null,
      address: person.address || null,
      createdAt: null, // This will be ignored in edit operations
    };
    setEditingPerson(dbPerson);
  };

  const handleDeletePerson = (personId: string) => {
    deleteMutation.mutate(personId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading people...</div>
      </div>
    );
  }

  return (
    <PersonList
      people={people}
      onAddPerson={handleAddPerson}
      onEditPerson={handleEditPerson}
      onDeletePerson={handleDeletePerson}
      editingPerson={editingPerson}
      onCancelEdit={() => setEditingPerson(null)}
    />
  );
}