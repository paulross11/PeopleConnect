import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  MapPin, 
  Calendar, 
  PoundSterling, 
  Users, 
  Building2,
  Clock,
  Mail,
  Phone,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Job as DbJob, type Person as DbPerson, type Client as DbClient } from "@shared/schema";
import PersonSelectDialog from "@/components/PersonSelectDialog";

interface JobWithDetails extends DbJob {
  client?: DbClient;
  assignedPeopleDetails?: DbPerson[];
}

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
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount / 100); // Convert from pence to pounds
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Not specified";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "Invalid date";
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

function formatDateOnly(date: Date | string | null | undefined): string {
  if (!date) return "Not specified";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "Invalid date";
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}

function formatTimeOnly(date: Date | string | null | undefined): string {
  if (!date) return "Not specified";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "Invalid time";
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

export default function JobDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const jobId = params.id;
  const [showPersonDialog, setShowPersonDialog] = useState(false);

  // Fetch job details - backend returns job with assignedPeople array
  const { data: dbJob, isLoading: jobLoading, error: jobError } = useQuery<DbJob & { assignedPeople: string[] }>({
    queryKey: ['/api/jobs', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }
      return response.json();
    },
    enabled: !!jobId,
  });

  // Fetch client details if job has clientId
  const { data: client } = useQuery<DbClient>({
    queryKey: ['/api/clients', dbJob?.clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${dbJob?.clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      return response.json();
    },
    enabled: !!dbJob?.clientId,
  });

  // Fetch all people to get details for assigned people
  const { data: allPeople = [] } = useQuery<DbPerson[]>({
    queryKey: ['/api/people'],
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
      setLocation('/jobs');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete job",
        variant: "destructive",
      });
    },
  });

  // Add person to job mutation
  const addPersonMutation = useMutation({
    mutationFn: async (personId: string) => {
      const response = await apiRequest('POST', `/api/jobs/${jobId}/people`, { personId });
      if (!response.ok) {
        throw new Error('Failed to add person to job');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Success",
        description: "Person added to job successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add person to job",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (jobId && confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleAddPerson = (person: DbPerson) => {
    addPersonMutation.mutate(person.id);
  };

  if (jobLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/jobs" data-testid="link-back-to-jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (jobError || !dbJob) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/jobs" data-testid="link-back-to-jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get assigned people details
  const assignedPeopleDetails = dbJob.assignedPeople 
    ? allPeople.filter(person => dbJob.assignedPeople?.includes(person.id))
    : [];

  return (
    <div className="space-y-6" data-testid="page-job-detail">
      <div className="flex items-center justify-between">
        <Link href="/jobs" data-testid="link-back-to-jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" data-testid="button-edit-job">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteJobMutation.isPending}
            data-testid="button-delete-job"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteJobMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Job Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold mb-2" data-testid="text-job-title">
                {dbJob.title}
              </CardTitle>
              {dbJob.description && (
                <p className="text-muted-foreground" data-testid="text-job-description">
                  {dbJob.description}
                </p>
              )}
            </div>
            <Badge 
              className={`ml-4 text-sm ${getStatusColor(dbJob.status)}`}
              data-testid="badge-job-status"
            >
              {dbJob.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job Date */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground" data-testid="text-job-date">
                  {formatDateOnly(dbJob.jobDate)}
                </p>
              </div>
            </div>

            {/* Job Time */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground" data-testid="text-job-time">
                  {formatTimeOnly(dbJob.jobDate)}
                </p>
              </div>
            </div>

            {/* Fee */}
            <div className="flex items-center gap-3">
              <PoundSterling className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Fee</p>
                <p className="text-sm text-muted-foreground" data-testid="text-job-fee">
                  {formatCurrency(dbJob.fee)}
                </p>
              </div>
            </div>

            {/* Address */}
            {dbJob.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-job-address">
                    {dbJob.address}
                  </p>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground" data-testid="text-job-created">
                  {formatDate(dbJob.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            {client ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Company</p>
                    <Link 
                      href={`/clients/${client.id}`} 
                      className="text-sm text-primary hover:underline" 
                      data-testid="link-client-name"
                    >
                      {client.name}
                    </Link>
                  </div>
                </div>

                {/* Lead Contact */}
                {client.leadContact && (
                  <div>
                    <p className="font-medium mb-2">Lead Contact</p>
                    <div className="space-y-2">
                      <p className="text-sm" data-testid="text-client-contact-name">
                        {client.leadContact}
                      </p>
                      {client.leadContactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={`mailto:${client.leadContactEmail}`} 
                            className="text-sm text-primary hover:underline"
                            data-testid="link-client-contact-email"
                          >
                            {client.leadContactEmail}
                          </a>
                        </div>
                      )}
                      {client.leadContactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={`tel:${client.leadContactPhone}`} 
                            className="text-sm text-primary hover:underline"
                            data-testid="link-client-contact-phone"
                          >
                            {client.leadContactPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Client Address */}
                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Client Address</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-client-address">
                        {client.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No client assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assigned People */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assigned People ({assignedPeopleDetails.length})
            </CardTitle>
            <Button
              onClick={() => setShowPersonDialog(true)}
              size="sm"
              data-testid="button-add-person"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignedPeopleDetails.length > 0 ? (
            <div className="space-y-3">
              {assignedPeopleDetails.map((person) => (
                <div key={person.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div className="flex-1">
                    <Link 
                      href={`/people/${person.id}`} 
                      className="font-medium text-primary hover:underline" 
                      data-testid={`link-person-${person.id}`}
                    >
                      {person.name}
                    </Link>
                    <div className="flex items-center gap-4 mt-1">
                      {person.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={`mailto:${person.email}`} 
                            className="text-sm text-muted-foreground hover:text-primary"
                            data-testid={`link-person-email-${person.id}`}
                          >
                            {person.email}
                          </a>
                        </div>
                      )}
                      {person.telephone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={`tel:${person.telephone}`} 
                            className="text-sm text-muted-foreground hover:text-primary"
                            data-testid={`link-person-phone-${person.id}`}
                          >
                            {person.telephone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No people assigned to this job yet</p>
              <p className="text-sm text-muted-foreground">Click "Add Person" to assign someone to this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Person Select Dialog */}
      <PersonSelectDialog
        open={showPersonDialog}
        onOpenChange={setShowPersonDialog}
        onPersonSelect={handleAddPerson}
        excludePersonIds={dbJob?.assignedPeople || []}
        isLoading={addPersonMutation.isPending}
      />
    </div>
  );
}