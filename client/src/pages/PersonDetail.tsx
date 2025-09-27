import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Person as DbPerson, type Job } from "@shared/schema";

// Convert database person to frontend format
const dbPersonToFrontend = (dbPerson: DbPerson) => ({
  id: dbPerson.id,
  name: dbPerson.name,
  email: dbPerson.email || undefined,
  telephone: dbPerson.telephone || undefined,
  address: dbPerson.address || undefined,
  jobs: [] as Job[], // Will be populated separately
});

interface Job {
  id: string;
  title: string;
  status: string;
  client?: {
    id: string;
    name: string;
  };
  jobDate?: Date | null;
  fee?: number | null;
}

interface PersonWithJobs {
  id: string;
  name: string;
  email?: string;
  telephone?: string;
  address?: string;
  jobs: Job[];
}

export default function PersonDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const personId = params.id;

  // Fetch person details
  const { data: dbPerson, isLoading: personLoading, error: personError } = useQuery<DbPerson>({
    queryKey: ['/api/people', personId],
    queryFn: async () => {
      const response = await fetch(`/api/people/${personId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch person');
      }
      return response.json();
    },
    enabled: !!personId,
  });

  // Fetch all jobs to find ones assigned to this person
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Fetch clients to enrich job data
  const { data: clients = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['/api/clients'],
  });

  // Delete person mutation
  const deletePersonMutation = useMutation({
    mutationFn: async (personId: string) => {
      const response = await apiRequest('DELETE', `/api/people/${personId}`);
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
      setLocation('/people');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete person. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-chart-1 text-white';
      case 'in-progress':
        return 'bg-chart-2 text-white';
      case 'pending':
        return 'bg-chart-3 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleDeletePerson = () => {
    if (confirm("Are you sure you want to delete this person? This action cannot be undone.")) {
      deletePersonMutation.mutate(personId!);
    }
  };

  if (personLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (personError || !dbPerson) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Person Not Found</h1>
          <p className="text-muted-foreground mb-4">The person you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/people">Back to People</Link>
          </Button>
        </div>
      </div>
    );
  }

  const person = dbPersonToFrontend(dbPerson);
  
  // Filter jobs that are assigned to this person
  const personJobs = jobs.filter(job => 
    job.assignedPeople && job.assignedPeople.includes(personId!)
  ).map(job => ({
    ...job,
    client: clients.find(client => client.id === job.clientId)
  }));

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/people" data-testid="button-back-to-people">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to People
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-3xl font-bold">Person Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-edit-person">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeletePerson}
            data-testid="button-delete-person"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Person Info Card */}
        <div className="lg:col-span-1">
          <Card data-testid="card-person-info">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl" data-testid="text-person-name">
                    {person.name}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {personJobs.length} job{personJobs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium" data-testid="text-person-email">
                      <a href={`mailto:${person.email}`} className="hover:underline">
                        {person.email}
                      </a>
                    </p>
                  </div>
                </div>
              )}
              {person.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium" data-testid="text-person-phone">
                      <a href={`tel:${person.telephone}`} className="hover:underline">
                        {person.telephone}
                      </a>
                    </p>
                  </div>
                </div>
              )}
              {person.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium" data-testid="text-person-address">
                      {person.address}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Jobs Section */}
        <div className="lg:col-span-2">
          <Card data-testid="card-person-jobs">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Assigned Jobs ({personJobs.length})
                {personJobs.length > 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/jobs">View All Jobs</Link>
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : personJobs.length > 0 ? (
                <div className="space-y-4">
                  {personJobs.map((job) => (
                    <Card key={job.id} className="border-l-4 border-l-primary" data-testid={`card-job-${job.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold" data-testid={`text-job-title-${job.id}`}>
                                {job.title}
                              </h3>
                              <Badge 
                                variant="secondary" 
                                className={getStatusColor(job.status)}
                                data-testid={`badge-job-status-${job.id}`}
                              >
                                {job.status}
                              </Badge>
                            </div>
                            {job.client && (
                              <p className="text-sm text-muted-foreground">
                                Client: {job.client.name}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {job.jobDate && (
                                <span>
                                  Date: {new Date(job.jobDate).toLocaleDateString()}
                                </span>
                              )}
                              {job.fee && (
                                <span>
                                  Fee: ${job.fee.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/jobs`}>View Job</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No jobs assigned to this person</p>
                  <Button variant="outline" asChild>
                    <Link href="/jobs">Assign Jobs</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}