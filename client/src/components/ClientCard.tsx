import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, User, Phone, Mail, Edit, Trash2, Users } from "lucide-react";
import { Link } from "wouter";
import type { Client } from "@shared/schema";

interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (clientId: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const extraContactsCount = client.extraContacts ? (client.extraContacts as any[]).length : 0;

  return (
    <Card className="group hover-elevate cursor-pointer h-fit" data-testid={`card-client-${client.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="w-5 h-5" />
            <span data-testid={`text-client-name-${client.id}`} className="line-clamp-1">
              <Link href={`/clients/${client.id}`} className="hover:underline cursor-pointer" data-testid={`link-client-name-${client.id}`}>
                {client.name}
              </Link>
            </span>
          </CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(client);
              }}
              data-testid={`button-edit-client-${client.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(client.id);
              }}
              data-testid={`button-delete-client-${client.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Address */}
        {client.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-client-address-${client.id}`}>
              {client.address}
            </span>
          </div>
        )}

        {/* Lead Contact */}
        {client.leadContact && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lead Contact</span>
            </div>
            <div className="ml-6 space-y-1">
              <div className="text-sm" data-testid={`text-lead-contact-name-${client.id}`}>
                {client.leadContact}
              </div>
              {client.leadContactPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span data-testid={`text-lead-contact-phone-${client.id}`}>
                    {client.leadContactPhone}
                  </span>
                </div>
              )}
              {client.leadContactEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span data-testid={`text-lead-contact-email-${client.id}`}>
                    {client.leadContactEmail}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extra Contacts Count */}
        {extraContactsCount > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" data-testid={`badge-extra-contacts-${client.id}`}>
              {extraContactsCount} additional contact{extraContactsCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {/* Created Date */}
        {client.createdAt && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Added {new Date(client.createdAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}