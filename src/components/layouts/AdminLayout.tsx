import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Users, LogOut, Menu, Wrench } from "lucide-react";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Admin Access Check
    if (!user) {
        // Redirect to login if not logged in
        // In a real app, strict role checks would go here
        // For this demo, we allow any logged-in user to see the admin panel, 
        // OR we could force a specific email.
    }

    const navItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin",
        },
        {
            label: "Bookings",
            icon: Calendar,
            path: "/admin/bookings",
        },
        {
            label: "Users",
            icon: Users,
            path: "/admin/users",
        },
        {
            label: "Maintenance Logs",
            icon: Wrench,
            path: "/admin/maintenance",
        },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={`
          flex flex-col bg-card border-r transition-all duration-300
          ${isSidebarOpen ? "w-64" : "w-16"}
        `}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    {isSidebarOpen && (
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Admin
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 py-4 flex flex-col gap-2 px-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.path}
                            variant={location.pathname === item.path ? "secondary" : "ghost"}
                            className={`
                justify-start gap-3
                ${!isSidebarOpen && "justify-center px-0"}
              `}
                            onClick={() => navigate(item.path)}
                        >
                            <item.icon className="w-5 h-5" />
                            {isSidebarOpen && <span>{item.label}</span>}
                        </Button>
                    ))}
                </div>

                <div className="p-2 border-t">
                    <Button
                        variant="ghost"
                        className={`
              w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10
              ${!isSidebarOpen && "justify-center px-0"}
            `}
                        onClick={() => navigate("/")}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Exit Admin</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-secondary/10">
                <div className="container mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
