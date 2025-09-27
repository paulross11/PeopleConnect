import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Edit, Trash2, Eye, Briefcase } from "lucide-react";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface PersonListViewProps {
  people: Person[];
  onEditPerson?: (person: Person) => void;
  onDeletePerson?: (personId: string) => void;
  onViewJobs?: (personId: string) => void;
}

export default function PersonListView({ 
  people,
  onEditPerson,
  onDeletePerson,
  onViewJobs 
}: PersonListViewProps) {
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Contact</TableHead>
            <TableHead className="w-[250px]">Address</TableHead>
            <TableHead className="w-[150px]">Jobs</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow 
              key={person.id} 
              className="hover-elevate"
              data-testid={`row-person-${person.id}`}
            >
              {/* Name Column */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm" data-testid={`text-person-name-${person.id}`}>
                      <Link href={`/people/${person.id}`} className="hover:underline cursor-pointer" data-testid={`link-person-name-${person.id}`}>
                        {person.name}
                      </Link>
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Contact Column */}
              <TableCell>
                <div className="space-y-1">
                  {person.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span data-testid={`text-person-email-${person.id}`} className="truncate">
                        {truncateText(person.email, 25)}
                      </span>
                    </div>
                  )}
                  {person.telephone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span data-testid={`text-person-phone-${person.id}`}>
                        {person.telephone}
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Address Column */}
              <TableCell>
                {person.address && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span data-testid={`text-person-address-${person.id}`} className="truncate">
                      {truncateText(person.address, 40)}
                    </span>
                  </div>
                )}
              </TableCell>

              {/* Jobs Column */}
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {person.jobs?.length || 0} job{person.jobs?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {person.jobs && person.jobs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {person.jobs.slice(0, 2).map((job) => (
                        <Badge 
                          key={job.id}
                          className={`text-xs px-1 py-0 ${getStatusColor(job.status)}`}
                          data-testid={`badge-job-status-${job.id}`}
                        >
                          {job.status}
                        </Badge>
                      ))}
                      {person.jobs.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{person.jobs.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Actions Column */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {person.jobs && person.jobs.length > 0 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7"
                      onClick={() => onViewJobs?.(person.id)}
                      data-testid={`button-view-jobs-${person.id}`}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7"
                    onClick={() => onEditPerson?.(person)}
                    data-testid={`button-edit-${person.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7"
                    onClick={() => onDeletePerson?.(person.id)}
                    data-testid={`button-delete-${person.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}