import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, User } from "lucide-react";

interface PersonFormProps {
  person?: {
    id: string;
    name: string;
    email?: string;
    telephone?: string;
    address?: string;
  };
  onSave?: (data: PersonFormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export interface PersonFormData {
  name: string;
  email: string;
  telephone: string;
  address: string;
}

export default function PersonForm({ person, onSave, onCancel, isEditing = false }: PersonFormProps) {
  const [formData, setFormData] = useState<PersonFormData>({
    name: person?.name || "",
    email: person?.email || "",
    telephone: person?.telephone || "",
    address: person?.address || "",
  });

  const [errors, setErrors] = useState<Partial<PersonFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave?.(formData);
      console.log('Person saved:', formData);
    }
  };

  const handleInputChange = (field: keyof PersonFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {isEditing ? 'Edit Person' : 'Add New Person'}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                data-testid="input-person-name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1" data-testid="error-name">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                data-testid="input-person-email"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1" data-testid="error-email">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="telephone">Phone Number</Label>
              <Input
                id="telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                data-testid="input-person-phone"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street, City, State 12345"
                rows={3}
                data-testid="input-person-address"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
              data-testid="button-save-person"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Person' : 'Save Person'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}