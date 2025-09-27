import { useState } from "react";
import PersonCard from "./PersonCard";
import PersonListView from "./PersonListView";
import PersonForm from "./PersonForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Filter, LayoutGrid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  id: string;
  title: string;
  status: string;
  clientName?: string;
}

interface Person {
  id: string;
  name: string;
  email?: string;
  telephone?: string;
  address?: string;
  jobs?: Job[];
}

interface PersonListProps {
  people?: Person[];
  onAddPerson?: () => void;
  onEditPerson?: (person: Person) => void;
  onDeletePerson?: (personId: string) => void;
}

export default function PersonList({ 
  people = [], 
  onAddPerson,
  onEditPerson,
  onDeletePerson 
}: PersonListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Filter people based on search query and status
  const filteredPeople = people.filter(person => {
    const matchesSearch = !searchQuery || 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "with-jobs" && person.jobs && person.jobs.length > 0) ||
      (statusFilter === "no-jobs" && (!person.jobs || person.jobs.length === 0));

    return matchesSearch && matchesStatus;
  });

  const totalJobs = people.reduce((total, person) => 
    total + (person.jobs?.length || 0), 0
  );

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <PersonForm
          onSave={(data) => {
            console.log('New person saved:', data);
            setShowAddForm(false);
            onAddPerson?.();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            People
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your contacts and their job assignments
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          data-testid="button-add-person"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Person
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total People</p>
            <p className="text-2xl font-bold" data-testid="stat-total-people">
              {people.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <div className="p-2 bg-chart-1/10 rounded-lg">
            <Search className="w-5 h-5 text-chart-1" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Filtered Results</p>
            <p className="text-2xl font-bold" data-testid="stat-filtered-people">
              {filteredPeople.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <div className="p-2 bg-chart-2/10 rounded-lg">
            <Filter className="w-5 h-5 text-chart-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold" data-testid="stat-total-jobs">
              {totalJobs}
            </p>
          </div>
        </div>
      </div>

      {/* Search, Filter and View Toggle Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search people by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-people"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All People</SelectItem>
            <SelectItem value="with-jobs">With Jobs</SelectItem>
            <SelectItem value="no-jobs">No Jobs</SelectItem>
          </SelectContent>
        </Select>
        
        {/* View Mode Toggle */}
        <div className="flex bg-muted p-1 rounded-lg" data-testid="view-toggle">
          <Button
            size="sm"
            variant={viewMode === "card" ? "default" : "ghost"}
            onClick={() => setViewMode("card")}
            className="flex items-center gap-2 px-3"
            data-testid="button-card-view"
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2 px-3"
            data-testid="button-list-view"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {filteredPeople.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                id={person.id}
                name={person.name}
                email={person.email}
                telephone={person.telephone}
                address={person.address}
                jobs={person.jobs}
                onEdit={() => {
                  console.log('Edit person:', person.id);
                  onEditPerson?.(person);
                }}
                onDelete={() => {
                  console.log('Delete person:', person.id);
                  onDeletePerson?.(person.id);
                }}
                onViewJobs={() => console.log('View jobs for person:', person.id)}
              />
            ))}
          </div>
        ) : (
          <PersonListView
            people={filteredPeople}
            onEditPerson={(person) => {
              console.log('Edit person:', person.id);
              onEditPerson?.(person);
            }}
            onDeletePerson={(personId) => {
              console.log('Delete person:', personId);
              onDeletePerson?.(personId);
            }}
            onViewJobs={(personId) => console.log('View jobs for person:', personId)}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted/20 rounded-full mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || statusFilter !== "all" ? "No people found" : "No people yet"}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first person to the database"
            }
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button 
              onClick={() => setShowAddForm(true)}
              data-testid="button-add-first-person"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Person
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {(searchQuery || statusFilter !== "all") && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Filter: {statusFilter === "with-jobs" ? "With Jobs" : "No Jobs"}
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}