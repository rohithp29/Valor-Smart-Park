import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Filter, Ban, CheckCircle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Booking {
    id: string;
    parking_lot_name: string;
    slot_number: string;
    floor: number;
    vehicle_type: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    total_cost: number;
    status: string;
    created_at: string;
    user_id?: string;
}

const AdminBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        // Load bookings from local storage
        const loadBookings = () => {
            const storedBookings = localStorage.getItem("bookings");
            if (storedBookings) {
                setBookings(JSON.parse(storedBookings));
            }
        };

        loadBookings();

        // Listen for storage events (though this only works across tabs usually)
        // We can also poll or just rely on mount
    }, []);

    const handleCancelBooking = (bookingId: string) => {
        const updatedBookings = bookings.map((b) => {
            if (b.id === bookingId) {
                return { ...b, status: "cancelled" };
            }
            return b;
        });

        setBookings(updatedBookings);
        localStorage.setItem("bookings", JSON.stringify(updatedBookings));
        toast.success("Booking cancelled by Admin");
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.parking_lot_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (booking.user_id && booking.user_id.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
            statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-muted-foreground">
                        Manage all parking reservations.
                    </p>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by ID, Parking Lot, or User ID..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking ID</TableHead>
                                <TableHead>Parking Lot</TableHead>
                                <TableHead>Slot</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium text-xs font-mono text-muted-foreground">
                                            {booking.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell>{booking.parking_lot_name}</TableCell>
                                        <TableCell>
                                            {booking.floor}-{booking.slot_number}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{format(new Date(booking.start_time), "MMM d, yyyy")}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {format(new Date(booking.start_time), "h:mm a")} - {format(new Date(booking.end_time), "h:mm a")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    booking.status === "active"
                                                        ? "default" // or success if available, default is primary
                                                        : booking.status === "cancelled"
                                                            ? "destructive"
                                                            : "secondary"
                                                }
                                                className={booking.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                                            >
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>₹{booking.total_cost}</TableCell>
                                        <TableCell className="text-right">
                                            {booking.status === "active" && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                            <Ban className="w-4 h-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will cancel the booking for {booking.parking_lot_name}. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Close</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleCancelBooking(booking.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Confirm Cancel
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
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

export default AdminBookings;
