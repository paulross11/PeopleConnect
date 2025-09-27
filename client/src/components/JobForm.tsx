import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertJobSchema, type Client, type Person } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, PoundSterling, MapPin, Users, Briefcase } from "lucide-react";

// Extend the insert schema for the form
const jobFormSchema = insertJobSchema.extend({
  jobDate: z.string().optional(),
  fee: z.number().min(0, "Fee must be non-negative").optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string;
}

export default function JobForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  title = "Create New Job"
}: JobFormProps) {
  // Fetch clients for dropdown
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch people for multi-select
  const { data: people = [], isLoading: peopleLoading } = useQuery<Person[]>({
    queryKey: ['/api/people'],
  });

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || "pending",
      jobDate: initialData?.jobDate || "",
      address: initialData?.address || "",
      fee: initialData?.fee || 0,
      clientId: initialData?.clientId || "",
      assignedPeople: initialData?.assignedPeople || [],
    },
  });

  const handleSubmit = (data: JobFormData) => {
    // Convert date string to Date object if provided, and ensure proper typing
    const processedData: any = {
      ...data,
      jobDate: data.jobDate ? new Date(data.jobDate) : undefined,
    };
    onSubmit(processedData);
  };

  const selectedPeople = form.watch('assignedPeople') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-chart-1/10 rounded-lg">
          <Briefcase className="w-5 h-5 text-chart-1" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter job title..." 
                        {...field} 
                        data-testid="input-job-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter job description..." 
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-job-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-job-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Client and Schedule Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={clientsLoading}>
                      <FormControl>
                        <SelectTrigger data-testid="select-job-client">
                          <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Select a client"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Job Date
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local"
                        {...field} 
                        data-testid="input-job-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Job Address
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter job address..." 
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-job-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <PoundSterling className="w-4 h-4" />
                      Fee Amount
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-job-fee"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Assigned People Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Assigned People
              </CardTitle>
            </CardHeader>
            <CardContent>
              {peopleLoading ? (
                <p className="text-muted-foreground">Loading people...</p>
              ) : (
                <FormField
                  control={form.control}
                  name="assignedPeople"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {people.map((person) => (
                          <FormField
                            key={person.id}
                            control={form.control}
                            name="assignedPeople"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={person.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(person.id)}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...(field.value || []), person.id]
                                          : (field.value || []).filter((id) => id !== person.id);
                                        field.onChange(updatedValue);
                                      }}
                                      data-testid={`checkbox-person-${person.id}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {person.name}
                                    {person.email && (
                                      <span className="text-muted-foreground ml-1">
                                        ({person.email})
                                      </span>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      {selectedPeople.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedPeople.length} people selected
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              data-testid="button-submit-job"
            >
              {isSubmitting ? "Saving..." : "Save Job"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel-job"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}