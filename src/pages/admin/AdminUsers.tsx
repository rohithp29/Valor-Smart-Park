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
import { Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Booking {
    id: string;
    user_id?: string;
    created_at: string;
    // other fields...
}

interface UserSummary {
    userId: string;
    totalBookings: number;
    lastActive: string;
    status: "Active" | "Inactive";
}

const AdminUsers = () => {
    const [users, setUsers] = useState<UserSummary[]>([]);

    useEffect(() => {
        // Derive users from bookings
        const bookings: Booking[] = JSON.parse(localStorage.getItem("bookings") || "[]");

        const userMap = new Map<string, UserSummary>();

        bookings.forEach((booking) => {
            if (!booking.user_id) return;

            const existing = userMap.get(booking.user_id) || {
                userId: booking.user_id,
                totalBookings: 0,
                lastActive: booking.created_at,
                status: "Active"
            };

            existing.totalBookings += 1;
            if (new Date(booking.created_at) > new Date(existing.lastActive)) {
                existing.lastActive = booking.created_at;
            }

            userMap.set(booking.user_id, existing);
        });

        setUsers(Array.from(userMap.values()));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground">
                    View users who have interacted with the platform.
                </p>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Bookings</TableHead>
                            <TableHead>Last Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No users found (users appear here after making a booking).
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.userId}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`} alt="Avatar" />
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">User</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> user@{user.userId.slice(0, 4)}.com
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{user.userId}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.totalBookings}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(user.lastActive), "MMM d, yyyy")}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default AdminUsers;
