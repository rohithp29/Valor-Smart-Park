import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, IndianRupee, Car, Bike, Zap, User, LogOut, Map, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ParkingMap from "@/components/ParkingMap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Chennai parking lots data with geographic coordinates
const parkingLots = [
  {
    id: 1,
    name: "T Nagar Shopping Complex",
    location: "T Nagar, Chennai",
    distance: "0.5 km",
    pricePerHour: 40,
    availableSlots: 32,
    totalSlots: 120,
    vehicleTypes: ["car", "bike", "ev"],
    lat: 13.0405,
    lng: 80.2337,
  },
  {
    id: 2,
    name: "Anna Nagar Metro Parking",
    location: "Anna Nagar, Chennai",
    distance: "1.2 km",
    pricePerHour: 30,
    availableSlots: 45,
    totalSlots: 100,
    vehicleTypes: ["car", "bike"],
    lat: 13.0850,
    lng: 80.2120,
  },
  {
    id: 3,
    name: "Phoenix Marketcity Mall",
    location: "Velachery, Chennai",
    distance: "3.5 km",
    pricePerHour: 50,
    availableSlots: 89,
    totalSlots: 250,
    vehicleTypes: ["car", "bike", "ev"],
    lat: 12.9915,
    lng: 80.2170,
  },
  {
    id: 4,
    name: "Chennai Airport Parking",
    location: "Meenambakkam, Chennai",
    distance: "12 km",
    pricePerHour: 70,
    availableSlots: 156,
    totalSlots: 400,
    vehicleTypes: ["car", "bike", "ev"],
    lat: 12.9815,
    lng: 80.1800,
  },
  {
    id: 5,
    name: "Marina Beach Parking",
    location: "Marina Beach, Chennai",
    distance: "2.8 km",
    pricePerHour: 35,
    availableSlots: 28,
    totalSlots: 80,
    vehicleTypes: ["car", "bike"],
    lat: 13.0475,
    lng: 80.2824,
  },
  {
    id: 6,
    name: "Express Avenue Mall",
    location: "Royapettah, Chennai",
    distance: "1.8 km",
    pricePerHour: 45,
    availableSlots: 67,
    totalSlots: 180,
    vehicleTypes: ["car", "bike", "ev"],
    lat: 13.0587,
    lng: 80.2641,
  },
  {
    id: 7,
    name: "Anna Nagar Tower Parking",
    location: "Anna Nagar, Chennai",
    distance: "1.5 km",
    pricePerHour: 45,
    availableSlots: 24,
    totalSlots: 80,
    vehicleTypes: ["car", "bike"],
    lat: 13.0835,
    lng: 80.2104,
  },
  {
    id: 8,
    name: "Poonamalle Metro Parking",
    location: "Poonamallee, Chennai",
    distance: "18 km",
    pricePerHour: 25,
    availableSlots: 70,
    totalSlots: 150,
    vehicleTypes: ["car", "bike", "ev"],
    lat: 13.0483,
    lng: 80.0963,
  },
  {
    id: 9,
    name: "Tambaram Railway Station Parking",
    location: "Tambaram, Chennai",
    distance: "22 km",
    pricePerHour: 30,
    availableSlots: 110,
    totalSlots: 300,
    vehicleTypes: ["car", "bike", "ev"],
    lat: 12.9249,
    lng: 80.1218,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const { user } = useAuth();
  const { toast } = useToast();
  const [fastagDialogOpen, setFastagDialogOpen] = useState(false);
  const [fastagDetails, setFastagDetails] = useState<{ vehicleNumber: string; fastagId: string; provider: string } | null>(null);
  
  // Dialog Form states
  const [vehicleNumberInput, setVehicleNumberInput] = useState("");
  const [fastagIdInput, setFastagIdInput] = useState("");
  const [providerInput, setProviderInput] = useState("Paytm Payments Bank");
  const [fastagLinkingLoading, setFastagLinkingLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`fastag_${user.uid}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFastagDetails(parsed);
        setVehicleNumberInput(parsed.vehicleNumber);
        setFastagIdInput(parsed.fastagId || "");
        setProviderInput(parsed.provider);
      }
    }
  }, [user]);

  const handleLinkFastag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!vehicleNumberInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your vehicle registration number.",
        variant: "destructive",
      });
      return;
    }

    const cleanFastagId = fastagIdInput.trim();
    if (!cleanFastagId || cleanFastagId.length !== 12 || isNaN(Number(cleanFastagId))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 12-digit numeric FASTag ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setFastagLinkingLoading(true);
      // Simulate NHAI API verification call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDetails = {
        vehicleNumber: vehicleNumberInput.toUpperCase().replace(/\s+/g, ""),
        fastagId: cleanFastagId,
        provider: providerInput,
      };

      localStorage.setItem(`fastag_${user.uid}`, JSON.stringify(newDetails));
      setFastagDetails(newDetails);
      
      toast({
        title: "FASTag Linked Successfully!",
        description: `Verified vehicle ${newDetails.vehicleNumber} and FASTag ID ${newDetails.fastagId}.`,
      });
      setFastagDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "FASTag linking failed",
        description: "Verification timed out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFastagLinkingLoading(false);
    }
  };

  const handleUnlinkFastag = () => {
    if (!user) return;
    localStorage.removeItem(`fastag_${user.uid}`);
    setFastagDetails(null);
    setVehicleNumberInput("");
    setFastagIdInput("");
    toast({
      title: "FASTag Account Unlinked",
      description: "You will need to pay manually for upcoming bookings.",
    });
  };

  const filteredLots = parkingLots.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return "success";
    if (percentage > 20) return "warning";
    return "destructive";
  };

  const vehicleIcons = {
    car: Car,
    bike: Bike,
    ev: Zap,
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-16 px-4 relative">
        <div className="absolute top-4 right-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                  <Car className="w-4 h-4 mr-2 text-primary" />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFastagDialogOpen(true)}>
                  <Zap className="w-4 h-4 mr-2 text-amber-500" />
                  {fastagDetails ? "FASTag Linked" : "Link FASTag"}
                  {fastagDetails && <Check className="w-4 h-4 ml-auto text-green-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="secondary" onClick={() => navigate("/auth")}>
              Login
            </Button>
          )}
        </div>
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Smart Parking Made Easy
          </h1>
          <p className="text-lg md:text-xl text-center mb-8 opacity-90">
            Book your parking slot in seconds, just like booking a movie ticket
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-card rounded-xl p-2 shadow-card">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by location or parking name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-800 font-medium"
                />
              </div>
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Search
              </Button>
            </div>
          </div>

          {/* Separate Interactive Button to open map view */}
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 gap-2 font-bold shadow-lg h-11 px-6 rounded-full transition-all duration-300 hover:scale-105"
              onClick={() => {
                setViewMode("map");
                const section = document.getElementById("parking-section");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <Map className="w-5 h-5 text-accent animate-pulse" />
              View nearby lots on Map 🗺️
            </Button>
          </div>
        </div>
      </section>

      {/* Parking Lots Section */}
      <section id="parking-section" className="py-12 px-4 scroll-mt-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header & Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Available Parking Lots
              </h2>
              <p className="text-muted-foreground">
                {filteredLots.length} parking lots near you
              </p>
            </div>
            
            {/* List / Map Switcher */}
            <div className="flex gap-1.5 bg-secondary/80 backdrop-blur p-1 rounded-lg border shadow-sm">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`text-xs px-4 h-8 font-bold transition-all duration-200 ${
                  viewMode === "list" ? "shadow-sm bg-background text-foreground" : "text-muted-foreground"
                }`}
              >
                List View
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className={`text-xs px-4 h-8 font-bold flex gap-1.5 items-center transition-all duration-200 ${
                  viewMode === "map" ? "shadow-sm bg-background text-foreground" : "text-muted-foreground"
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                Map View
              </Button>
            </div>
          </div>

          {/* Interactive Views */}
          {viewMode === "map" ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ParkingMap parkingLots={filteredLots} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLots.map((lot) => (
                <Card
                  key={lot.id}
                  className="p-6 hover:shadow-card transition-all duration-300 cursor-pointer border-2 hover:border-primary flex flex-col justify-between group"
                  onClick={() => navigate(`/booking/${lot.id}`)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{lot.name}</h3>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{lot.location}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-secondary font-semibold">
                        {lot.distance}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Price:</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-lg">
                          <IndianRupee className="w-4 h-4" />
                          <span>{lot.pricePerHour}/hr</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Availability:
                        </span>
                        <Badge variant={getAvailabilityColor(lot.availableSlots, lot.totalSlots)}>
                          {lot.availableSlots}/{lot.totalSlots} slots
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Vehicle Types:
                        </span>
                        <div className="flex gap-2">
                          {lot.vehicleTypes.map((type) => {
                            const Icon = vehicleIcons[type as keyof typeof vehicleIcons];
                            return (
                              <div
                                key={type}
                                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border"
                                title={type}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-primary hover:opacity-90 mt-auto group-hover:scale-[1.01] transition-transform">
                    View & Book Slots
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* FASTag Account Linking Dialog */}
      <Dialog open={fastagDialogOpen} onOpenChange={setFastagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white font-extrabold uppercase italic px-3 py-1 rounded text-sm tracking-widest shadow-sm">
                FAST<span className="text-yellow-300">ag</span>
              </div>
              <DialogTitle className="text-xl font-bold">Link Account</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Link your FASTag ID to enable instant, contactless payments directly at Chennai smart parking gates.
            </DialogDescription>
          </DialogHeader>

          {fastagDetails ? (
            <div className="space-y-6 py-4">
              <div className="bg-slate-50 border rounded-xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-green-500/10 text-green-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1 border-l border-b border-green-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active & Linked
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Linked Vehicle</span>
                  <span className="text-xl font-black text-slate-800 tracking-wider font-mono">
                    {fastagDetails.vehicleNumber}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">FASTag ID</span>
                  <span className="text-md font-bold text-slate-700 font-mono tracking-wider">
                    {fastagDetails.fastagId}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Issuing Provider Bank</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {fastagDetails.provider}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 font-bold"
                  onClick={handleUnlinkFastag}
                >
                  Unlink FASTag Account
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-slate-500 text-xs font-semibold"
                  onClick={() => setFastagDialogOpen(false)}
                >
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLinkFastag} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-number" className="font-bold text-xs text-slate-700">
                  Vehicle Registration Number (FASTag Linked)
                </Label>
                <Input
                  id="vehicle-number"
                  placeholder="e.g. TN07BY1234 or TN 07 BY 1234"
                  value={vehicleNumberInput}
                  onChange={(e) => setVehicleNumberInput(e.target.value)}
                  className="uppercase tracking-wider font-mono text-center font-bold text-slate-800"
                  required
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Ensure the registration matches the license plate registered on your FASTag.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fastag-id" className="font-bold text-xs text-slate-700">
                  FASTag ID (12-Digit Numeric ID)
                </Label>
                <Input
                  id="fastag-id"
                  placeholder="e.g. 123456789012"
                  value={fastagIdInput}
                  onChange={(e) => setFastagIdInput(e.target.value)}
                  className="tracking-widest text-center font-bold text-slate-800 font-mono"
                  maxLength={12}
                  required
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Enter the 12-digit NHAI identification number on your FASTag sticker RFID.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fastag-provider" className="font-bold text-xs text-slate-700">
                  FASTag Issuing Bank/Provider
                </Label>
                <select
                  id="fastag-provider"
                  value={providerInput}
                  onChange={(e) => setProviderInput(e.target.value)}
                  className="w-full h-10 border rounded-md px-3 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring text-slate-800"
                >
                  <option value="Paytm Payments Bank">Paytm Payments Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="IDFC First Bank">IDFC First Bank</option>
                </select>
              </div>

              <div className="bg-slate-50 border p-3 rounded-lg text-[11px] text-muted-foreground flex gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  By linking your FASTag, you authorize SmartPark to verify your credentials with the NHAI database and facilitate automated toll/parking charges at partner facilities.
                </span>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary font-bold shadow-md text-white"
                disabled={fastagLinkingLoading}
              >
                {fastagLinkingLoading ? "Verifying FASTag..." : "Verify & Link FASTag"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
