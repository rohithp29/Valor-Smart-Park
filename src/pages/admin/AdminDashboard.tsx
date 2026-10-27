
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, IndianRupee, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        {
            label: "Total Revenue",
            value: "₹0",
            icon: IndianRupee,
            trend: "+0%",
            color: "text-green-500",
        },
        {
            label: "Active Bookings",
            value: "0",
            icon: Calendar,
            trend: "+0",
            color: "text-blue-500",
        },
        {
            label: "Total Bookings",
            value: "0",
            icon: Users, // using Users icon for total bookings generic
            trend: "+0",
            color: "text-purple-500",
        },
        {
            label: "Avg. Duration",
            value: "0h",
            icon: TrendingUp,
            trend: "+0%",
            color: "text-orange-500",
        },
    ]);

    useEffect(() => {
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

        const totalRevenue = bookings.reduce((acc: number, b: any) => acc + (b.total_cost || 0), 0);
        const activeBookings = bookings.filter((b: any) => b.status === "active").length;
        const totalBookingsCount = bookings.length;

        const averageDuration = bookings.length > 0
            ? Math.round(bookings.reduce((acc: number, b: any) => acc + (b.duration_hours || 0), 0) / bookings.length)
            : 0;

        setStats([
            {
                label: "Total Revenue",
                value: `₹${totalRevenue.toLocaleString()}`,
                icon: IndianRupee,
                trend: "+12%", // Mock trend
                color: "text-green-500",
            },
            {
                label: "Active Bookings",
                value: activeBookings.toString(),
                icon: Calendar,
                trend: "Live",
                color: "text-blue-500",
            },
            {
                label: "Total Bookings",
                value: totalBookingsCount.toString(),
                icon: Calendar,
                trend: "All time",
                color: "text-purple-500",
            },
            {
                label: "Avg. Duration",
                value: `${averageDuration}h`,
                icon: TrendingUp,
                trend: "Per booking",
                color: "text-orange-500",
            },
        ]);
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your parking management system.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </span>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-bold">{stat.value}</span>
                            <span className={`text-xs ${stat.color} flex items-center`}>
                                {stat.trend} from last month
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Placeholder for charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 p-6">
                    <h3 className="text-lg font-medium mb-4">Revenue Overview</h3>
                    <div className="h-[200px] flex items-center justify-center border rounded bg-secondary/20 text-muted-foreground">
                        Chart Placeholder
                    </div>
                </Card>
                <Card className="col-span-3 p-6">
                    <h3 className="text-lg font-medium mb-4">Recent Sales</h3>
                    <div className="h-[200px] flex items-center justify-center border rounded bg-secondary/20 text-muted-foreground">
                        List Placeholder
                    </div>
                </Card>
            </div>
        </div>
    );
}
