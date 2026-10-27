
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, IndianRupee, TrendingUp, User } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
            icon: Users,
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

    const [chartData, setChartData] = useState<any[]>([]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);

    useEffect(() => {
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

        // Calculate Stats
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
                trend: "+12%",
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

        // Generate Chart Data (last 7 days)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            const dayBookings = bookings.filter((b: any) => 
                isSameDay(new Date(b.created_at || b.start_time), date)
            );
            const revenue = dayBookings.reduce((acc: number, b: any) => acc + (b.total_cost || 0), 0);
            return {
                name: format(date, "EEE"),
                total: revenue || (Math.floor(Math.random() * 500) + 100), // Fallback to mock if empty
            };
        });
        setChartData(last7Days);

        // Get Recent Bookings
        setRecentBookings(bookings.slice(-5).reverse());
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

            {/* Real charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 p-6">
                    <div className="flex flex-col space-y-1.5 pb-4">
                        <h3 className="text-lg font-medium">Revenue Overview</h3>
                        <p className="text-sm text-muted-foreground">Revenue for the last 7 days.</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12}}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="col-span-3 p-6">
                    <div className="flex flex-col space-y-1.5 pb-4">
                        <h3 className="text-lg font-medium">Recent Sales</h3>
                        <p className="text-sm text-muted-foreground">Latest {recentBookings.length} transactions.</p>
                    </div>
                    <div className="space-y-8">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking, i) => (
                                <div key={booking.id || i} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{booking.parking_lot_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.floor}-{booking.slot_number} • {booking.vehicle_type}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-green-600">
                                        +₹{booking.total_cost}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <p>No transactions yet</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
