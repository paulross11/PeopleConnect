import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Briefcase, Calendar, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { type Job as DbJob } from "@shared/schema";

interface JobWithDetails extends DbJob {
  assignedPeople?: string[];
  client?: {
    id: string;
    name: string;
  };
}

interface JobSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobSelect: (job: JobWithDetails) => void;
  excludeJobIds?: string[]; // Jobs that already have this person assigned
  isLoading?: boolean;
}

export default function JobSelectDialog({
  open,
  onOpenChange,
  onJobSelect,
  excludeJobIds = [],
  isLoading = false,
}: JobSelectDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobWithDetails | null>(null);

  // Fetch all jobs
  const { data: allJobs = [], isLoading: jobsLoading } = useQuery<JobWithDetails[]>({
    queryKey: ['/api/jobs'],
    enabled: open, // Only fetch when dialog is open
  });

  // Fetch clients to enrich job data
  const { data: clients = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['/api/clients'],
    enabled: open,
  });

  // Enhance jobs with client data and filter available jobs
  const availableJobs = allJobs
    .map(job => ({
      ...job,
      client: clients.find(client => client.id === job.clientId)
    }))
    .filter((job) => {
      const isExcluded = excludeJobIds.includes(job.id);
      const matchesSearch = searchQuery === "" || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return !isExcluded && matchesSearch;
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

  const handleJobClick = (job: JobWithDetails) => {
    setSelectedJob(job);
  };

  const handleConfirm = () => {
    if (selectedJob) {
      onJobSelect(selectedJob);
      setSelectedJob(null);
      setSearchQuery("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedJob(null);
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col" data-testid="dialog-job-select">
        <DialogHeader>
          <DialogTitle>Add to Job</DialogTitle>
          <DialogDescription>
            Select a job to assign this person to. Jobs that already have this person assigned are not shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="space-y-2">
            <Input
              placeholder="Search jobs by title, client, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-jobs"
            />
          </div>

          {/* Job List */}
          <div className="flex-1 overflow-y-auto space-y-3" data-testid="job-list">
            {jobsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : availableJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No jobs match your search." : "No available jobs to assign."}
              </div>
            ) : (
              availableJobs.map((job) => (
                <Card
                  key={job.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedJob?.id === job.id ? 'ring-2 ring-primary bg-muted' : ''
                  }`}
                  onClick={() => handleJobClick(job)}
                  data-testid={`job-card-${job.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{job.title}</h3>
                            <Badge 
                              variant="secondary" 
                              className={getStatusColor(job.status)}
                            >
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {job.client && (
                          <p className="text-sm text-muted-foreground ml-7">
                            Client: {job.client.name}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-7">
                          {job.jobDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(job.jobDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {job.fee && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${job.fee.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground ml-7 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                      {selectedJob?.id === job.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedJob || isLoading}
            data-testid="button-confirm-job"
          >
            {isLoading ? "Adding..." : "Add to Job"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}