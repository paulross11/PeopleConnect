import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import JobList from "@/components/JobList";
import { type Job, type Client, type Person } from "@shared/schema";

interface JobWithDetails extends Job {
  client?: Client;
  assignedPeopleDetails?: Person[];
}

export default function Jobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingJob, setEditingJob] = useState<JobWithDetails | null>(null);

  // Fetch jobs, clients, and people for enriching data
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: people = [] } = useQuery<Person[]>({
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

  const handleEditJob = (job: JobWithDetails) => {
    setEditingJob(job);
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation.mutate(jobId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <JobList
        editingJob={editingJob}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
}