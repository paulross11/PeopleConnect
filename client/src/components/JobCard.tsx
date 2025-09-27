import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Edit3, 
  Trash2, 
  Building2,
  Clock
} from "lucide-react";
import { type Job, type Client, type Person } from "@shared/schema";

interface JobWithDetails extends Job {
  client?: Client;
  assignedPeopleDetails?: Person[];
}

interface JobCardProps {
  job: JobWithDetails;
  onEdit?: (job: JobWithDetails) => void;
  onDelete?: (jobId: string) => void;
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100); // Convert from cents to dollars
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

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const {
    id,
    title,
    description,
    status,
    jobDate,
    address,
    fee,
    client,
    assignedPeopleDetails,
    createdAt
  } = job;

  return (
    <Card className="hover-elevate" data-testid={`card-job-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate" data-testid={`text-job-title-${id}`}>
              <Link 
                href={`/jobs/${id}`} 
                className="text-foreground hover:text-primary hover:underline transition-colors"
                data-testid={`link-job-title-${id}`}
              >
                {title}
              </Link>
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`text-job-description-${id}`}>
                {description}
              </p>
            )}
          </div>
          <Badge 
            className={`ml-3 text-xs ${getStatusColor(status)}`}
            data-testid={`badge-job-status-${id}`}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Client Information */}
        {client && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Client:</span>
            <span data-testid={`text-job-client-${id}`}>{client.name}</span>
          </div>
        )}

        {/* Job Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Date:</span>
          <span data-testid={`text-job-date-${id}`}>{formatDate(jobDate)}</span>
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium">Address:</span>
              <p className="text-muted-foreground mt-1" data-testid={`text-job-address-${id}`}>
                {address}
              </p>
            </div>
          </div>
        )}

        {/* Fee */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Fee:</span>
          <span data-testid={`text-job-fee-${id}`}>{formatCurrency(fee)}</span>
        </div>

        {/* Assigned People */}
        {assignedPeopleDetails && assignedPeopleDetails.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                Assigned People ({assignedPeopleDetails.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {assignedPeopleDetails.slice(0, 3).map((person) => (
                <Badge 
                  key={person.id} 
                  variant="outline" 
                  className="text-xs"
                  data-testid={`badge-person-${person.id}`}
                >
                  {person.name}
                </Badge>
              ))}
              {assignedPeopleDetails.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{assignedPeopleDetails.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Created Date */}
        {createdAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="w-3 h-3" />
            <span>Created {formatDate(createdAt)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(job)}
              className="flex items-center gap-1"
              data-testid={`button-edit-job-${id}`}
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(id)}
              className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
              data-testid={`button-delete-job-${id}`}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}