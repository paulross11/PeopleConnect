import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Building, Plus, Trash2 } from "lucide-react";
import type { ExtraContact } from "@shared/schema";

interface ClientFormProps {
  client?: {
    id: string;
    name: string;
    address?: string;
    leadContact?: string;
    leadContactPhone?: string;
    leadContactEmail?: string;
    extraContacts?: ExtraContact[];
  };
  onSave?: (data: ClientFormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export interface ClientFormData {
  name: string;
  address: string;
  leadContact: string;
  leadContactPhone: string;
  leadContactEmail: string;
  extraContacts: ExtraContact[];
}

export default function ClientForm({ client, onSave, onCancel, isEditing = false }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: client?.name || "",
    address: client?.address || "",
    leadContact: client?.leadContact || "",
    leadContactPhone: client?.leadContactPhone || "",
    leadContactEmail: client?.leadContactEmail || "",
    extraContacts: client?.extraContacts || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }
    
    if (formData.leadContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leadContactEmail)) {
      newErrors.leadContactEmail = "Please enter a valid email address";
    }

    // Validate extra contacts
    const invalidContacts = formData.extraContacts.some(contact => {
      return !contact.name.trim() || 
             (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email));
    });

    if (invalidContacts) {
      newErrors.extraContacts = "Please check extra contact details";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave?.(formData);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addExtraContact = () => {
    setFormData(prev => ({
      ...prev,
      extraContacts: [...prev.extraContacts, { name: "", phone: "", email: "" }]
    }));
  };

  const removeExtraContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extraContacts: prev.extraContacts.filter((_, i) => i !== index)
    }));
  };

  const updateExtraContact = (index: number, field: keyof ExtraContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      extraContacts: prev.extraContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          {isEditing ? 'Edit Client' : 'Add New Client'}
        </CardTitle>
        {onCancel && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            data-testid="button-cancel-form"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Client Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter client name"
                  data-testid="input-client-name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-name">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter client address"
                  data-testid="input-client-address"
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Lead Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Lead Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="leadContact">Contact Name</Label>
                <Input
                  id="leadContact"
                  value={formData.leadContact}
                  onChange={(e) => handleInputChange('leadContact', e.target.value)}
                  placeholder="Enter lead contact name"
                  data-testid="input-lead-contact-name"
                />
              </div>

              <div>
                <Label htmlFor="leadContactPhone">Phone Number</Label>
                <Input
                  id="leadContactPhone"
                  value={formData.leadContactPhone}
                  onChange={(e) => handleInputChange('leadContactPhone', e.target.value)}
                  placeholder="Enter phone number"
                  data-testid="input-lead-contact-phone"
                />
              </div>

              <div>
                <Label htmlFor="leadContactEmail">Email Address</Label>
                <Input
                  id="leadContactEmail"
                  type="email"
                  value={formData.leadContactEmail}
                  onChange={(e) => handleInputChange('leadContactEmail', e.target.value)}
                  placeholder="contact@example.com"
                  data-testid="input-lead-contact-email"
                  className={errors.leadContactEmail ? 'border-destructive' : ''}
                />
                {errors.leadContactEmail && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-lead-email">
                    {errors.leadContactEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Extra Contacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Additional Contacts</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExtraContact}
                data-testid="button-add-contact"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {formData.extraContacts.map((contact, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`contact-name-${index}`}>Name *</Label>
                    <Input
                      id={`contact-name-${index}`}
                      value={contact.name}
                      onChange={(e) => updateExtraContact(index, 'name', e.target.value)}
                      placeholder="Contact name"
                      data-testid={`input-extra-contact-name-${index}`}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`contact-phone-${index}`}>Phone</Label>
                    <Input
                      id={`contact-phone-${index}`}
                      value={contact.phone || ""}
                      onChange={(e) => updateExtraContact(index, 'phone', e.target.value)}
                      placeholder="Phone number"
                      data-testid={`input-extra-contact-phone-${index}`}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`contact-email-${index}`}>Email</Label>
                      <Input
                        id={`contact-email-${index}`}
                        type="email"
                        value={contact.email || ""}
                        onChange={(e) => updateExtraContact(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                        data-testid={`input-extra-contact-email-${index}`}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeExtraContact(index)}
                        data-testid={`button-remove-contact-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {errors.extraContacts && (
              <p className="text-sm text-destructive" data-testid="error-extra-contacts">
                {errors.extraContacts}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              data-testid="button-save-client"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Client' : 'Save Client'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}