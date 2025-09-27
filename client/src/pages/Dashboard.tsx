import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Building2, Plus, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  //todo: remove mock functionality
  const stats = {
    totalPeople: 12,
    totalJobs: 8,
    totalClients: 5,
    activeJobs: 3,
    completedJobs: 4,
    pendingJobs: 1,
  };

  const recentActivity = [
    { id: 1, type: 'person', action: 'Added new person', name: 'John Smith', time: '2 hours ago' },
    { id: 2, type: 'job', action: 'Job completed', name: 'Website Development', time: '5 hours ago' },
    { id: 3, type: 'client', action: 'New client added', name: 'Acme Corp', time: '1 day ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your CRM system. Here's an overview of your data.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-dashboard-people">
              {stats.totalPeople}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-1">+2</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-dashboard-jobs">
              {stats.activeJobs}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-2">+1</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-dashboard-clients">
              {stats.totalClients}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-1">+1</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-dashboard-completion">
              85%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-1">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" data-testid="button-quick-add-person">
              <Link href="/people">
                <Users className="w-4 h-4 mr-2" />
                Add New Person
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" disabled>
              <span>
                <Briefcase className="w-4 h-4 mr-2" />
                Create New Job
                <Badge variant="secondary" className="ml-auto">
                  Soon
                </Badge>
              </span>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" disabled>
              <span>
                <Building2 className="w-4 h-4 mr-2" />
                Add New Client
                <Badge variant="secondary" className="ml-auto">
                  Soon
                </Badge>
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates in your CRM system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {activity.type === 'person' && <Users className="w-4 h-4 text-primary" />}
                    {activity.type === 'job' && <Briefcase className="w-4 h-4 text-chart-1" />}
                    {activity.type === 'client' && <Building2 className="w-4 h-4 text-chart-2" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.name}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Job Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Jobs Overview
          </CardTitle>
          <CardDescription>
            Current status of all jobs in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-chart-1/10 rounded-lg">
              <div className="text-2xl font-bold text-chart-1">{stats.completedJobs}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-4 bg-chart-2/10 rounded-lg">
              <div className="text-2xl font-bold text-chart-2">{stats.activeJobs}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center p-4 bg-chart-3/10 rounded-lg">
              <div className="text-2xl font-bold text-chart-3">{stats.pendingJobs}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}