import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, LayoutGrid, List, Calendar, DollarSign, Users, Building2, MapPin, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import JobForm from "./JobForm";
import JobCard from "./JobCard";
import { type Job, type Client, type Person, type InsertJob } from "@shared/schema";

interface JobWithDetails extends Job {
  client?: Client;
  assignedPeople?: string[]; // From the backend helper methods
  assignedPeopleDetails?: Person[];
}

// Utility functions
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-chart-1/20 text-chart-1 border-chart-1/30";
    case "in-progress":
      return "bg-chart-2/20 text-chart-2 border-chart-2/30";
    case "pending":
      return "bg-chart-3/20 text-chart-3 border-chart-3/30";
    case "cancelled":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return "Not specified";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100);
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Not specified";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}

// Form data type for compatibility with frontend form (jobDate as string)
type JobFormData = Omit<InsertJob, 'jobDate'> & {
  jobDate?: string; // Form uses string for datetime-local input
};

interface JobListProps {
  editingJob?: JobWithDetails | null;
  onCancelEdit?: () => void;
  onEditJob?: (job: JobWithDetails) => void;
}

export default function JobList({ editingJob, onCancelEdit, onEditJob }: JobListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");

  // Fetch jobs with assigned people (API returns enriched data)
  const { data: jobs = [], isLoading, error } = useQuery<(Job & { assignedPeople: string[] })[]>({
    queryKey: ['/api/jobs'],
  });

  // Fetch clients for enriching job data
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch people for enriching job data
  const { data: people = [] } = useQuery<Person[]>({
    queryKey: ['/api/people'],
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await apiRequest('POST', '/api/jobs', data);
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Job created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JobFormData }) => {
      const response = await apiRequest('PUT', `/api/jobs/${id}`, data);
      if (!response.ok) {
        throw new Error('Failed to update job');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      onCancelEdit?.();
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest('DELETE', `/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enrich jobs with client and people details
  const enrichedJobs: JobWithDetails[] = jobs.map(job => {
    const client = clients.find(c => c.id === job.clientId);
    const assignedPeopleDetails = job.assignedPeople
      ? people.filter(person => job.assignedPeople?.includes(person.id))
      : [];
    
    return {
      ...job,
      client,
      assignedPeopleDetails,
    };
  });

  // Filter jobs
  const filteredJobs = enrichedJobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === "in-progress").length;
  const completedJobs = jobs.filter(job => job.status === "completed").length;
  const pendingJobs = jobs.filter(job => job.status === "pending").length;

  const handleCreateJob = (data: JobFormData) => {
    createJobMutation.mutate(data);
  };

  const handleUpdateJob = (data: JobFormData) => {
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data });
    }
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleEditJob = (job: JobWithDetails) => {
    onEditJob?.(job);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive">Failed to load jobs</p>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/jobs'] })}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <JobForm
        title="Create New Job"
        onSubmit={handleCreateJob}
        onCancel={() => setShowAddForm(false)}
        isSubmitting={createJobMutation.isPending}
      />
    );
  }

  if (editingJob) {
    return (
      <JobForm
        title="Edit Job"
        initialData={{
          title: editingJob.title,
          description: editingJob.description,
          status: editingJob.status,
          jobDate: editingJob.jobDate ? new Date(editingJob.jobDate).toISOString().slice(0, 16) : "",
          address: editingJob.address,
          fee: editingJob.fee || 0,
          clientId: editingJob.clientId,
          assignedPeople: editingJob.assignedPeople || [],
        }}
        onSubmit={handleUpdateJob}
        onCancel={onCancelEdit || (() => {})}
        isSubmitting={updateJobMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage and track all jobs</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
          data-testid="button-add-job"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <div className="p-2 bg-chart-1/10 rounded-lg">
            <Filter className="w-5 h-5 text-chart-1" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold" data-testid="stat-total-jobs">{totalJobs}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <div className="p-2 bg-chart-2/10 rounded-lg">
            <Filter className="w-5 h-5 text-chart-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold" data-testid="stat-active-jobs">{activeJobs}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <div className="p-2 bg-chart-3/10 rounded-lg">
            <Filter className="w-5 h-5 text-chart-3" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold" data-testid="stat-completed-jobs">{completedJobs}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <div className="p-2 bg-chart-4/10 rounded-lg">
            <Filter className="w-5 h-5 text-chart-4" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold" data-testid="stat-pending-jobs">{pendingJobs}</p>
          </div>
        </div>
      </div>

      {/* Search, Filter and View Toggle Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, description, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-jobs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
      {filteredJobs.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4" data-testid="jobs-list">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover-elevate" data-testid={`list-job-${job.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Title and Status Row */}
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg truncate">
                          <Link 
                            href={`/jobs/${job.id}`} 
                            className="text-foreground hover:text-primary hover:underline transition-colors"
                            data-testid={`link-job-title-${job.id}`}
                          >
                            {job.title}
                          </Link>
                        </h3>
                        <Badge 
                          className={`text-xs ${getStatusColor(job.status)}`}
                          data-testid={`badge-job-status-${job.id}`}
                        >
                          {job.status}
                        </Badge>
                      </div>

                      {/* Job Details Row */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {job.client && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span data-testid={`text-job-client-${job.id}`}>{job.client.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span data-testid={`text-job-date-${job.id}`}>{formatDate(job.jobDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span data-testid={`text-job-fee-${job.id}`}>{formatCurrency(job.fee)}</span>
                        </div>
                        
                        {job.assignedPeopleDetails && job.assignedPeopleDetails.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span data-testid={`text-job-people-${job.id}`}>
                              {job.assignedPeopleDetails.length} assigned
                            </span>
                          </div>
                        )}
                        
                        {job.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-32" data-testid={`text-job-address-${job.id}`}>
                              {job.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditJob(job)}
                        data-testid={`button-edit-job-${job.id}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteJob(job.id)}
                        data-testid={`button-delete-job-${job.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" 
              ? "No jobs match your search criteria"
              : "No jobs yet. Create your first job to get started."
            }
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="mt-4"
              data-testid="button-add-first-job"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Job
            </Button>
          )}
        </div>
      )}
    </div>
  );
}