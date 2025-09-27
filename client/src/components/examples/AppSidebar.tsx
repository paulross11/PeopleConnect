import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Sidebar Example</h1>
            <p className="text-muted-foreground">
              This demonstrates the sidebar navigation for the CRM system. 
              The sidebar includes navigation to People (currently active), 
              Jobs and Clients (coming soon), plus system settings.
            </p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}