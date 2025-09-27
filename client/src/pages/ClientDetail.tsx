import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Trash2, Mail, Phone, MapPin, Building, User, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Client, type Job as DbJob, type ExtraContact } from "@shared/schema";

interface JobWithDetails extends DbJob {
  assignedPeople?: string[];
}

export default function ClientDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const clientId = params.id;

  // Fetch client details
  const { data: client, isLoading: clientLoading, error: clientError } = useQuery<Client>({
    queryKey: ['/api/clients', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      return response.json();
    },
    enabled: !!clientId,
  });

  // Fetch all jobs to find ones for this client
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobWithDetails[]>({
    queryKey: ['/api/jobs'],
  });

  // Fetch people to enrich job data
  const { data: people = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['/api/people'],
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
      setLocation('/clients');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleDeleteClient = () => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      deleteClientMutation.mutate(clientId!);
    }
  };

  if (clientLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Client Not Found</h1>
          <p className="text-muted-foreground mb-4">The client you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/clients">Back to Clients</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter jobs that belong to this client
  const clientJobs = jobs.filter(job => job.clientId === clientId).map(job => ({
    ...job,
    assignedPeople: people.filter(person => 
      job.assignedPeople && job.assignedPeople.includes(person.id)
    )
  }));

  const extraContacts = (client.extraContacts as ExtraContact[] | null) || [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients" data-testid="button-back-to-clients">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-3xl font-bold">Client Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-edit-client">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteClient}
            data-testid="button-delete-client"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <div className="lg:col-span-1">
          <Card data-testid="card-client-info">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl" data-testid="text-client-name">
                    {client.name}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {clientJobs.length} job{clientJobs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium" data-testid="text-client-address">
                      {client.address}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Lead Contact Section */}
              {client.leadContact && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Lead Contact</p>
                  </div>
                  <div className="ml-6 space-y-2">
                    <p className="font-medium" data-testid="text-lead-contact-name">
                      {client.leadContact}
                    </p>
                    {client.leadContactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm" data-testid="text-lead-contact-phone">
                          <a href={`tel:${client.leadContactPhone}`} className="hover:underline">
                            {client.leadContactPhone}
                          </a>
                        </p>
                      </div>
                    )}
                    {client.leadContactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm" data-testid="text-lead-contact-email">
                          <a href={`mailto:${client.leadContactEmail}`} className="hover:underline">
                            {client.leadContactEmail}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extra Contacts */}
              {extraContacts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Additional Contacts ({extraContacts.length})</p>
                  </div>
                  <div className="ml-6 space-y-3">
                    {extraContacts.map((contact, index) => (
                      <div key={index} className="space-y-1">
                        <p className="font-medium text-sm" data-testid={`text-extra-contact-name-${index}`}>
                          {contact.name}
                        </p>
                        <div className="space-y-1">
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                <a href={`tel:${contact.phone}`} className="hover:underline">
                                  {contact.phone}
                                </a>
                              </p>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                <a href={`mailto:${contact.email}`} className="hover:underline">
                                  {contact.email}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Jobs Section */}
        <div className="lg:col-span-2">
          <Card data-testid="card-client-jobs">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Client Jobs ({clientJobs.length})
                <div className="flex gap-2">
                  <Button variant="default" size="sm" asChild data-testid="button-add-job">
                    <Link href="/jobs">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Job
                    </Link>
                  </Button>
                  {clientJobs.length > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/jobs">View All Jobs</Link>
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : clientJobs.length > 0 ? (
                <div className="space-y-4">
                  {clientJobs.map((job) => (
                    <Card key={job.id} className="bg-primary/5" data-testid={`card-job-${job.id}`}>
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
                            {job.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {job.description}
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
                              {job.assignedPeople && job.assignedPeople.length > 0 && (
                                <span>
                                  {job.assignedPeople.length} person{job.assignedPeople.length !== 1 ? 's' : ''} assigned
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
                  <p className="text-muted-foreground mb-4">No jobs for this client</p>
                  <Button variant="outline" asChild>
                    <Link href="/jobs">Create Jobs</Link>
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