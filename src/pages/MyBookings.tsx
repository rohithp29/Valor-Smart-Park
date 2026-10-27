import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, MapPin, Car, Bike, Zap, IndianRupee } from "lucide-react";
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

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings(user.uid);
    } else {
      // give auth context a moment or redirect
      // In this flow, wait for loading to finish from context
    }
  }, [user, navigate]);

  const fetchBookings = async (userId: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = allBookings.filter((b: Booking) => String(b.user_id) === String(userId))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setBookings(userBookings);
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 500));

    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = allBookings.map((b: any) => {
      if (b.id === bookingId) {
        return { ...b, status: "cancelled" };
      }
      return b;
    });

    localStorage.setItem('bookings', JSON.stringify(updatedBookings));

    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully",
    });

    if (user) {
      fetchBookings(user.uid);
    }
  };

  const vehicleIcons = {
    car: Car,
    bike: Bike,
    ev: Zap,
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const activeBookings = bookings.filter(b => b.status === "active" && isUpcoming(b.start_time));
  const pastBookings = bookings.filter(b => b.status === "cancelled" || !isUpcoming(b.start_time));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">My Bookings</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading bookings...</div>
        ) : (
          <>
            {/* Active Bookings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Upcoming Bookings ({activeBookings.length})
              </h2>
              {activeBookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No upcoming bookings</p>
                  <Button
                    className="mt-4 bg-gradient-primary"
                    onClick={() => navigate("/")}
                  >
                    Book a Slot
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((booking) => {
                    const VehicleIcon = vehicleIcons[booking.vehicle_type as keyof typeof vehicleIcons];
                    return (
                      <Card key={booking.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {booking.parking_lot_name}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>Floor {booking.floor} - Slot {booking.slot_number}</span>
                            </div>
                          </div>
                          <Badge variant="success">Active</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div className="font-medium">Start</div>
                              <div className="text-muted-foreground">
                                {format(new Date(booking.start_time), "MMM d, h:mm a")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div className="font-medium">End</div>
                              <div className="text-muted-foreground">
                                {format(new Date(booking.end_time), "MMM d, h:mm a")}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                              {VehicleIcon && <VehicleIcon className="w-4 h-4" />}
                            </div>
                            <div className="flex items-center gap-1 font-semibold text-lg">
                              <IndianRupee className="w-4 h-4" />
                              <span>{booking.total_cost}</span>
                            </div>
                          </div>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Cancel Booking</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this booking? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Bookings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Past Bookings ({pastBookings.length})
              </h2>
              {pastBookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No past bookings</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => {
                    const VehicleIcon = vehicleIcons[booking.vehicle_type as keyof typeof vehicleIcons];
                    return (
                      <Card key={booking.id} className="p-6 opacity-75">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {booking.parking_lot_name}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>Floor {booking.floor} - Slot {booking.slot_number}</span>
                            </div>
                          </div>
                          <Badge variant={booking.status === "cancelled" ? "destructive" : "outline"}>
                            {booking.status === "cancelled" ? "Cancelled" : "Completed"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(booking.start_time), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1 font-semibold">
                            <IndianRupee className="w-4 h-4" />
                            <span>{booking.total_cost}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
