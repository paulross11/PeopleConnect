import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Building, Phone, Mail, Users } from "lucide-react";
import type { Client } from "@shared/schema";

interface ClientListViewProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (clientId: string) => void;
}

export default function ClientListView({ clients, onEdit, onDelete }: ClientListViewProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No clients found</h3>
        <p className="text-sm text-muted-foreground">Start by adding your first client.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table data-testid="table-clients">
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Lead Contact</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Additional Contacts</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const extraContactsCount = client.extraContacts ? (client.extraContacts as any[]).length : 0;
            
            return (
              <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium" data-testid={`text-client-name-${client.id}`}>
                      {client.name}
                    </div>
                    {client.address && (
                      <div className="text-sm text-muted-foreground line-clamp-1" data-testid={`text-client-address-${client.id}`}>
                        {client.address}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {client.leadContact ? (
                    <div className="text-sm" data-testid={`text-lead-contact-name-${client.id}`}>
                      {client.leadContact}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No lead contact</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {client.leadContactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span data-testid={`text-lead-contact-phone-${client.id}`}>
                          {client.leadContactPhone}
                        </span>
                      </div>
                    )}
                    {client.leadContactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span data-testid={`text-lead-contact-email-${client.id}`}>
                          {client.leadContactEmail}
                        </span>
                      </div>
                    )}
                    {!client.leadContactPhone && !client.leadContactEmail && (
                      <span className="text-muted-foreground text-sm">No contact info</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {extraContactsCount > 0 ? (
                    <Badge variant="secondary" data-testid={`badge-extra-contacts-${client.id}`}>
                      <Users className="w-3 h-3 mr-1" />
                      {extraContactsCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit?.(client)}
                      data-testid={`button-edit-client-${client.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete?.(client.id)}
                      data-testid={`button-delete-client-${client.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}