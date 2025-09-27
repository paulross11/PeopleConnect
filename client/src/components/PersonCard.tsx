import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Edit, Trash2, Briefcase } from "lucide-react";
import { Link } from "wouter";

interface Job {
  id: string;
  title: string;
  status: string;
  clientName?: string;
}

interface PersonCardProps {
  id: string;
  name: string;
  email?: string;
  telephone?: string;
  address?: string;
  jobs?: Job[];
  onEdit?: () => void;
  onDelete?: () => void;
  onViewJobs?: () => void;
}

export default function PersonCard({ 
  id, 
  name, 
  email, 
  telephone, 
  address, 
  jobs = [],
  onEdit,
  onDelete,
  onViewJobs 
}: PersonCardProps) {
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

  return (
    <Card className="hover-elevate" data-testid={`card-person-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg" data-testid={`text-person-name-${id}`}>
              <Link href={`/people/${id}`} className="hover:underline cursor-pointer" data-testid={`link-person-name-${id}`}>
                {name}
              </Link>
            </CardTitle>
            {jobs.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            data-testid={`button-edit-${id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            data-testid={`button-delete-${id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span data-testid={`text-person-email-${id}`}>{email}</span>
            </div>
          )}
          {telephone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span data-testid={`text-person-phone-${id}`}>{telephone}</span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span data-testid={`text-person-address-${id}`} className="line-clamp-2">
                {address}
              </span>
            </div>
          )}
        </div>

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                Recent Jobs
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewJobs}
                data-testid={`button-view-jobs-${id}`}
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {jobs.slice(0, 3).map((job, index) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                  data-testid={`job-${job.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/jobs/${job.id}`} 
                      className="text-sm font-medium truncate text-foreground hover:text-primary hover:underline transition-colors block"
                      data-testid={`link-job-title-${job.id}`}
                    >
                      {job.title}
                    </Link>
                    {job.clientName && (
                      <p className="text-xs text-muted-foreground truncate">
                        {job.clientName}
                      </p>
                    )}
                  </div>
                  <Badge 
                    className={`ml-2 text-xs ${getStatusColor(job.status)}`}
                    data-testid={`badge-job-status-${job.id}`}
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}