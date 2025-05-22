
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const { toast } = useToast();

  // Check if WhatsApp API is configured
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
    const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY;
    
    if (apiUrl && apiKey && apiUrl !== 'https://api.whatsapp.com/send') {
      // Only show this toast when it's a real API (not the simulation link)
      toast({
        title: "WhatsApp API Configurada",
        description: "Acesse o gerenciador para conectar seu WhatsApp: " + apiUrl + "/manager",
      });
    }
  }, [toast]);

  // Close sidebar automatically on mobile when component mounts or viewport changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 w-full">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
