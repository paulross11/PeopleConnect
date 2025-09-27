import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, User, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { type Person } from "@shared/schema";

interface PersonSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonSelect: (person: Person) => void;
  excludePersonIds?: string[]; // People already assigned to the job
  isLoading?: boolean;
}

export default function PersonSelectDialog({
  open,
  onOpenChange,
  onPersonSelect,
  excludePersonIds = [],
  isLoading = false,
}: PersonSelectDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Fetch all people
  const { data: allPeople = [], isLoading: peopleLoading } = useQuery<Person[]>({
    queryKey: ['/api/people'],
    enabled: open, // Only fetch when dialog is open
  });

  // Filter available people (exclude already assigned and apply search)
  const availablePeople = allPeople.filter((person) => {
    const isExcluded = excludePersonIds.includes(person.id);
    const matchesSearch = searchQuery === "" || 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return !isExcluded && matchesSearch;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleConfirm = () => {
    if (selectedPerson) {
      onPersonSelect(selectedPerson);
      setSelectedPerson(null);
      setSearchQuery("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedPerson(null);
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" data-testid="dialog-person-select">
        <DialogHeader>
          <DialogTitle>Add Person to Job</DialogTitle>
          <DialogDescription>
            Select a person to assign to this job. People already assigned are not shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="space-y-2">
            <Input
              placeholder="Search people by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-people"
            />
          </div>

          {/* People List */}
          <div className="flex-1 overflow-auto space-y-3 min-h-0">
            {peopleLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : availablePeople.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {excludePersonIds.length === allPeople.length 
                    ? "All people are already assigned to this job"
                    : searchQuery 
                      ? "No people match your search"
                      : "No people available"
                  }
                </p>
              </div>
            ) : (
              availablePeople.map((person) => (
                <Card 
                  key={person.id} 
                  className={`cursor-pointer transition-colors hover-elevate ${
                    selectedPerson?.id === person.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => handlePersonClick(person)}
                  data-testid={`person-option-${person.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm font-medium">
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate" data-testid={`text-person-name-${person.id}`}>
                            {person.name}
                          </h3>
                          {selectedPerson?.id === person.id && (
                            <Check className="w-4 h-4 text-primary" data-testid="icon-selected" />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {person.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span className="truncate" data-testid={`text-person-email-${person.id}`}>
                                {person.email}
                              </span>
                            </div>
                          )}
                          {person.telephone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span data-testid={`text-person-phone-${person.id}`}>
                                {person.telephone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPerson || isLoading}
            data-testid="button-add-person"
          >
            {isLoading ? "Adding..." : "Add Person"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}