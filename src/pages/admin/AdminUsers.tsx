import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Mail,
    Phone,
    Calendar,
    Search,
    TrendingUp,
    MapPin,
    User,
    IndianRupee,
    Clock,
    Shield,
    FileText
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
    id: string;
    parking_lot_name: string;
    slot_number: string;
    floor: number;
    vehicle_type: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    price_per_hour?: number;
    total_cost: number;
    status: string;
    created_at: string;
    user_id?: string;
}

interface UserRecord {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    phone?: string;
    registeredAt: string;
    lastLoginAt: string;
    loginMethod: "Email" | "Google";
}

interface UserAnalytics extends UserRecord {
    bookingCount: number;
    totalSpent: number;
    locationsUsed: { [lotName: string]: number };
    bookingsHistory: Booking[];
}

const AdminUsers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [usersAnalytics, setUsersAnalytics] = useState<UserAnalytics[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserAnalytics | null>(null);

    // Summary stats
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [mostActiveUserName, setMostActiveUserName] = useState("N/A");
    const [avgBookingsPerUser, setAvgBookingsPerUser] = useState(0);
    const [topLocationName, setTopLocationName] = useState("N/A");

    useEffect(() => {
        // Seed mock users & bookings if empty so the dashboard immediately shows premium data
        const seedData = () => {
            const existingUsers = localStorage.getItem("admin_registered_users");
            const existingBookings = localStorage.getItem("bookings");

            if (!existingUsers) {
                const mockUsers: UserRecord[] = [
                    {
                        uid: "mock-user-ramesh",
                        name: "Ramesh Kumar",
                        email: "ramesh.kumar@gmail.com",
                        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh",
                        phone: "+91 98401 23456",
                        registeredAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
                        lastLoginAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
                        loginMethod: "Google"
                    },
                    {
                        uid: "mock-user-priya",
                        name: "Priya Sharma",
                        email: "priya.sharma@yahoo.com",
                        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
                        phone: "+91 97654 32109",
                        registeredAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
                        lastLoginAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
                        loginMethod: "Email"
                    },
                    {
                        uid: "mock-user-anand",
                        name: "Anand Krishnan",
                        email: "anand.k@outlook.com",
                        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anand",
                        phone: "+91 94440 98765",
                        registeredAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
                        lastLoginAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
                        loginMethod: "Email"
                    },
                    {
                        uid: "mock-user-deepa",
                        name: "Deepa Balaji",
                        email: "deepa.b@gmail.com",
                        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepa",
                        phone: "+91 91234 56789",
                        registeredAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
                        lastLoginAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
                        loginMethod: "Google"
                    }
                ];
                localStorage.setItem("admin_registered_users", JSON.stringify(mockUsers));
            }

            if (!existingBookings || JSON.parse(existingBookings).length === 0) {
                const mockBookings: Booking[] = [
                    {
                        id: "bk-1001",
                        user_id: "mock-user-ramesh",
                        parking_lot_name: "T Nagar Shopping Complex",
                        slot_number: "A-12",
                        floor: 1,
                        vehicle_type: "car",
                        start_time: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 3 * 3600 * 1000).toISOString(),
                        duration_hours: 3,
                        price_per_hour: 40,
                        total_cost: 120,
                        status: "completed",
                        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
                    },
                    {
                        id: "bk-1002",
                        user_id: "mock-user-ramesh",
                        parking_lot_name: "T Nagar Shopping Complex",
                        slot_number: "A-15",
                        floor: 1,
                        vehicle_type: "car",
                        start_time: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(),
                        duration_hours: 2,
                        price_per_hour: 40,
                        total_cost: 80,
                        status: "completed",
                        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
                    },
                    {
                        id: "bk-1003",
                        user_id: "mock-user-ramesh",
                        parking_lot_name: "Anna Nagar Multilevel Parking",
                        slot_number: "B-04",
                        floor: 2,
                        vehicle_type: "car",
                        start_time: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
                        duration_hours: 4,
                        price_per_hour: 50,
                        total_cost: 200,
                        status: "completed",
                        created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
                    },
                    {
                        id: "bk-1004",
                        user_id: "mock-user-priya",
                        parking_lot_name: "Velachery Phoenix Plaza",
                        slot_number: "C-10",
                        floor: 3,
                        vehicle_type: "car",
                        start_time: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 5 * 3600 * 1000).toISOString(),
                        duration_hours: 5,
                        price_per_hour: 60,
                        total_cost: 300,
                        status: "completed",
                        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
                    },
                    {
                        id: "bk-1005",
                        user_id: "mock-user-priya",
                        parking_lot_name: "Chennai International Airport",
                        slot_number: "A-01",
                        floor: 1,
                        vehicle_type: "car",
                        start_time: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 12 * 3600 * 1000).toISOString(),
                        duration_hours: 12,
                        price_per_hour: 80,
                        total_cost: 960,
                        status: "completed",
                        created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
                    },
                    {
                        id: "bk-1006",
                        user_id: "mock-user-anand",
                        parking_lot_name: "Marina Beach Parking Lot",
                        slot_number: "B-22",
                        floor: 2,
                        vehicle_type: "bike",
                        start_time: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 12 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(),
                        duration_hours: 2,
                        price_per_hour: 20,
                        total_cost: 40,
                        status: "completed",
                        created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
                    },
                    {
                        id: "bk-1007",
                        user_id: "mock-user-anand",
                        parking_lot_name: "Royapettah Metro Station",
                        slot_number: "A-05",
                        floor: 1,
                        vehicle_type: "bike",
                        start_time: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 8 * 24 * 3600 * 1000 + 3 * 3600 * 1000).toISOString(),
                        duration_hours: 3,
                        price_per_hour: 25,
                        total_cost: 75,
                        status: "completed",
                        created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
                    },
                    {
                        id: "bk-1008",
                        user_id: "mock-user-deepa",
                        parking_lot_name: "T Nagar Shopping Complex",
                        slot_number: "B-11",
                        floor: 2,
                        vehicle_type: "car",
                        start_time: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
                        end_time: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(),
                        duration_hours: 2,
                        price_per_hour: 40,
                        total_cost: 80,
                        status: "completed",
                        created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
                    }
                ];
                localStorage.setItem("bookings", JSON.stringify(mockBookings));
            }
        };

        seedData();

        // 2. Fetch data from localStorage
        const storedUsers: UserRecord[] = JSON.parse(localStorage.getItem("admin_registered_users") || "[]");
        const bookings: Booking[] = JSON.parse(localStorage.getItem("bookings") || "[]");

        // Compute location stats across the entire platform
        const platformLocations: { [key: string]: number } = {};
        bookings.forEach(b => {
            platformLocations[b.parking_lot_name] = (platformLocations[b.parking_lot_name] || 0) + 1;
        });

        let topLoc = "N/A";
        let topLocCount = 0;
        Object.entries(platformLocations).forEach(([loc, count]) => {
            if (count > topLocCount) {
                topLocCount = count;
                topLoc = loc;
            }
        });
        setTopLocationName(topLoc);

        // Compute analytics for each user
        const computedUsers: UserAnalytics[] = storedUsers.map((usr) => {
            const userBookings = bookings.filter((b) => b.user_id === usr.uid);
            
            // Locations breakdown
            const locMap: { [key: string]: number } = {};
            userBookings.forEach((b) => {
                locMap[b.parking_lot_name] = (locMap[b.parking_lot_name] || 0) + 1;
            });

            const totalSpent = userBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0);

            return {
                ...usr,
                bookingCount: userBookings.length,
                totalSpent: totalSpent,
                locationsUsed: locMap,
                bookingsHistory: userBookings.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
            };
        });

        // Compute aggregate metrics
        setTotalUsersCount(computedUsers.length);
        
        let mostActive = "N/A";
        let maxCount = -1;
        let sumBookings = 0;
        computedUsers.forEach(u => {
            sumBookings += u.bookingCount;
            if (u.bookingCount > maxCount) {
                maxCount = u.bookingCount;
                mostActive = u.name;
            }
        });

        setMostActiveUserName(maxCount > 0 ? `${mostActive} (${maxCount} bookings)` : "N/A");
        setAvgBookingsPerUser(computedUsers.length > 0 ? parseFloat((sumBookings / computedUsers.length).toFixed(1)) : 0);
        setUsersAnalytics(computedUsers);
    }, []);

    // Filtered users for search list
    const filteredUsers = usersAnalytics.filter((user) => {
        return (
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone && user.phone.includes(searchQuery))
        );
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users Analytics & Management</h1>
                <p className="text-muted-foreground">
                    Monitor registered accounts, tracking total parking usage frequency, preferences, and transaction details.
                </p>
            </div>

            {/* Metrics cards grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Registered Users</span>
                        <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-3xl font-extrabold">{totalUsersCount}</span>
                        <span className="text-xs text-muted-foreground">Active in database</span>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Most Active Driver</span>
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-lg font-bold truncate">{mostActiveUserName}</span>
                        <span className="text-xs text-muted-foreground">Top reservation count</span>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Avg. Frequency</span>
                        <Clock className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-3xl font-extrabold">{avgBookingsPerUser}</span>
                        <span className="text-xs text-muted-foreground">Bookings per registered user</span>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Top Parking Spot</span>
                        <MapPin className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-md font-bold truncate">{topLocationName}</span>
                        <span className="text-xs text-muted-foreground">Highest reservation traffic</span>
                    </div>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-full md:w-[350px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by name, email, phone..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-xs text-muted-foreground font-semibold">
                    Showing {filteredUsers.length} of {totalUsersCount} drivers
                </div>
            </div>

            {/* Table Card */}
            <Card className="border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-secondary/40">
                            <TableRow>
                                <TableHead className="font-bold">User Profile</TableHead>
                                <TableHead className="font-bold">Auth Method</TableHead>
                                <TableHead className="font-bold text-center">Parking Frequency</TableHead>
                                <TableHead className="font-bold">Locations Used & Counts</TableHead>
                                <TableHead className="font-bold text-right">Total Spent</TableHead>
                                <TableHead className="font-bold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No matching user records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.uid} className="hover:bg-muted/30 transition-colors">
                                        {/* Profile */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-primary/10">
                                                    <AvatarImage src={user.photoURL} alt={user.name} />
                                                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                                                        {user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground text-sm">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="w-3.5 h-3.5 text-muted-foreground/60" /> {user.email}
                                                    </span>
                                                    {user.phone && user.phone !== "N/A" && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Phone className="w-3.5 h-3.5 text-muted-foreground/60" /> {user.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Provider Method */}
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`font-semibold capitalize flex items-center w-fit gap-1.5 px-2.5 py-0.5 rounded-full ${
                                                    user.loginMethod === "Google"
                                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                                        : "bg-purple-50 text-purple-700 border-purple-200"
                                                }`}
                                            >
                                                {user.loginMethod === "Google" ? (
                                                    <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                                    </svg>
                                                ) : (
                                                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                                                )}
                                                {user.loginMethod}
                                            </Badge>
                                        </TableCell>

                                        {/* Frequency count */}
                                        <TableCell className="text-center">
                                            <Badge className="bg-gradient-primary text-primary-foreground font-bold px-3 py-1 text-xs">
                                                {user.bookingCount} bookings
                                            </Badge>
                                        </TableCell>

                                        {/* Where Used locations breakdown */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                                                {Object.keys(user.locationsUsed).length === 0 ? (
                                                    <span className="text-xs text-muted-foreground italic">No slots booked yet</span>
                                                ) : (
                                                    Object.entries(user.locationsUsed).map(([locName, count]) => (
                                                        <Badge
                                                            key={locName}
                                                            variant="secondary"
                                                            className="text-[11px] font-medium border text-slate-700 bg-slate-50 flex items-center gap-1"
                                                        >
                                                            <MapPin className="w-3 h-3 text-red-500" />
                                                            {locName.split(" ")[0]} ({count})
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Total Spent */}
                                        <TableCell className="text-right font-extrabold text-slate-800 text-sm">
                                            ₹{user.totalSpent.toLocaleString()}
                                        </TableCell>

                                        {/* Actions: Dialog detailing all user activity */}
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedUser(user)}
                                                        className="h-8 text-primary hover:text-primary-foreground hover:bg-primary"
                                                    >
                                                        <FileText className="w-4 h-4 mr-1.5" />
                                                        Activity Log
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                                                    <DialogHeader className="border-b pb-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                                <AvatarImage src={user.photoURL} alt={user.name} />
                                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="text-left">
                                                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                                                    {user.name}
                                                                    <Badge className="bg-gradient-primary">
                                                                        {user.bookingCount} Times Parked
                                                                    </Badge>
                                                                </DialogTitle>
                                                                <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                                                    {user.email} • {user.phone !== "N/A" ? user.phone : "No Phone"}
                                                                </DialogDescription>
                                                            </div>
                                                        </div>
                                                    </DialogHeader>

                                                    {/* Quick User summary inside Dialog */}
                                                    <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs font-semibold">Total Revenue</span>
                                                            <span className="font-extrabold text-lg text-primary">₹{user.totalSpent}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs font-semibold">Login Method</span>
                                                            <span className="font-extrabold text-md text-slate-800 capitalize flex items-center gap-1">
                                                                <Shield className="w-3.5 h-3.5 text-blue-500" /> {user.loginMethod}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs font-semibold">Registered At</span>
                                                            <span className="font-semibold text-slate-600">
                                                                {format(new Date(user.registeredAt), "MMM d, yyyy")}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Booking items detail */}
                                                    <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4 text-primary" />
                                                        Complete Parking History
                                                    </h3>

                                                    {user.bookingsHistory.length === 0 ? (
                                                        <div className="h-24 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                                                            No reservations made by this account.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {user.bookingsHistory.map((booking) => (
                                                                <div key={booking.id} className="p-4 border rounded-lg hover:bg-slate-50/50 transition-colors bg-card shadow-sm flex flex-col sm:flex-row justify-between gap-3 text-xs sm:text-sm">
                                                                    <div className="space-y-1">
                                                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                                                            <MapPin className="w-4 h-4 text-red-500" />
                                                                            {booking.parking_lot_name}
                                                                        </div>
                                                                        <div className="text-muted-foreground font-medium">
                                                                            Slot: <span className="font-bold text-slate-700">{booking.floor}F-{booking.slot_number}</span> • Type: <span className="uppercase text-primary font-bold">{booking.vehicle_type}</span>
                                                                        </div>
                                                                        <div className="text-muted-foreground text-xs font-semibold">
                                                                            {format(new Date(booking.start_time), "MMM d, yyyy hh:mm a")} - {format(new Date(booking.end_time), "hh:mm a")} ({booking.duration_hours} hrs)
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex sm:flex-col justify-between sm:justify-center items-end gap-2 border-t pt-2 sm:border-t-0 sm:pt-0">
                                                                        <Badge className={`w-fit font-bold uppercase text-[10px] ${
                                                                            booking.status === "active" || booking.status === "completed"
                                                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                                                : "bg-red-500 hover:bg-red-600 text-white"
                                                                        }`}>
                                                                            {booking.status}
                                                                        </Badge>
                                                                        <div className="font-extrabold text-slate-900 flex items-center gap-0.5 text-sm sm:text-md">
                                                                            <IndianRupee className="w-3.5 h-3.5 text-slate-700" />
                                                                            {booking.total_cost}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default AdminUsers;
