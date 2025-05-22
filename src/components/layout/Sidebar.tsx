
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calculator, CreditCard, Home, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  // Auto-collapse sidebar on mobile when navigating
  const shouldCollapse = isMobile || isTablet;
  
  const sidebarItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: Users,
      label: "Clientes",
      href: "/clientes",
    },
    {
      icon: CreditCard,
      label: "Dívidas",
      href: "/dividas",
    },
    {
      icon: Calculator,
      label: "Calculadora",
      href: "/calculadora",
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-[70px]",
        shouldCollapse && !isOpen ? "-translate-x-full" : "translate-x-0",
        "md:relative md:left-0 md:translate-x-0",
        isMobile && isOpen ? "shadow-xl" : ""
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <h1 className={cn("font-bold text-white", isOpen ? "text-xl" : "hidden")}>
          Debt Manager
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="text-white hover:text-white hover:bg-sidebar-accent"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <Link 
            key={item.href} 
            to={item.href}
            onClick={() => shouldCollapse && isOpen && toggleSidebar()}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                location.pathname === item.href && "bg-sidebar-accent",
                !isOpen && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5" />
              {isOpen && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-semibold">
            A
          </div>
          {isOpen && (
            <div>
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-sidebar-foreground opacity-70">admin@cobras.com</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile overlay backdrop when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </aside>
  );
};

export default Sidebar;
