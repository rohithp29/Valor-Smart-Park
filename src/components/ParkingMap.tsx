import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation, Compass, Volume2, VolumeX, ExternalLink, Info, CheckCircle2, IndianRupee, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Types
interface ParkingLot {
  id: number;
  name: string;
  location: string;
  distance: string;
  pricePerHour: number;
  availableSlots: number;
  totalSlots: number;
  vehicleTypes: string[];
  lat: number;
  lng: number;
}

interface ParkingMapProps {
  parkingLots: ParkingLot[];
}

// User Mock Coordinates (Nungambakkam, Chennai)
const USER_COORDS: [number, number] = [13.0470, 80.2420];

// Custom User Marker Icon (Pulsing Blue Dot)
const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div class="relative flex items-center justify-center" style="width: 24px; height: 24px;">
      <div class="absolute w-6 h-6 rounded-full bg-blue-500 opacity-40 animate-ping"></div>
      <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom Dynamic Parking Lot Marker Icons (Availability based)
const getParkingIcon = (available: number, total: number, isSelected: boolean) => {
  const percentage = (available / total) * 100;
  let bgClass = "bg-emerald-500 text-white border-emerald-600";
  let pingClass = "bg-emerald-400";
  
  if (percentage <= 20) {
    bgClass = "bg-rose-500 text-white border-rose-600";
    pingClass = "bg-rose-400";
  } else if (percentage <= 50) {
    bgClass = "bg-amber-500 text-white border-amber-600";
    pingClass = "bg-amber-400";
  }

  const borderClass = isSelected ? "ring-4 ring-offset-2 ring-primary scale-110" : "hover:scale-105";

  return L.divIcon({
    className: "custom-parking-marker",
    html: `
      <div class="relative flex flex-col items-center group transition-all duration-300 ${borderClass}">
        <div class="w-9 h-9 rounded-full ${bgClass} border-2 shadow-lg flex items-center justify-center font-bold text-sm">
          P
        </div>
        <div class="w-2.5 h-2.5 rotate-45 ${bgClass} border-r-2 border-b-2 -mt-1 shadow-sm"></div>
        <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full ${pingClass} border border-white animate-pulse"></div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38],
  });
};

interface MapContentProps {
  parkingLots: ParkingLot[];
  selectedLot: ParkingLot | null;
  routePath: [number, number][];
  mapCenter: [number, number];
  mapBounds?: L.LatLngBoundsExpression;
  handleMarkerClick: (lot: ParkingLot) => void;
  handleStartNavigation: (lot: ParkingLot) => void;
}

// Sub-component rendering all map layers inside MapContainer to avoid multi-children Context consumer bugs
const MapContent = ({
  parkingLots,
  selectedLot,
  routePath,
  mapCenter,
  mapBounds,
  handleMarkerClick,
  handleStartNavigation
}: MapContentProps) => {
  const map = useMap();
  const navigate = useNavigate();

  useEffect(() => {
    if (mapBounds) {
      map.fitBounds(mapBounds, { padding: [50, 50], maxZoom: 16, animate: true });
    } else {
      map.setView(mapCenter, map.getZoom(), { animate: true });
    }
  }, [mapCenter, mapBounds, map]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* User Location Marker */}
      <Marker position={USER_COORDS} icon={userIcon}>
        <Popup className="custom-leaflet-popup">
          <div className="p-1">
            <h4 className="font-bold text-sm text-primary">Your Location</h4>
            <p className="text-xs text-muted-foreground">Nungambakkam, Chennai</p>
          </div>
        </Popup>
      </Marker>

      {/* Parking Lot Markers */}
      {parkingLots.map((lot) => (
        <Marker
          key={lot.id}
          position={[lot.lat, lot.lng]}
          icon={getParkingIcon(lot.availableSlots, lot.totalSlots, selectedLot?.id === lot.id)}
          eventHandlers={{
            click: () => handleMarkerClick(lot)
          }}
        >
          <Popup className="custom-leaflet-popup">
            <div className="p-2 min-w-[200px]">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-foreground leading-tight">{lot.name}</h4>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">{lot.distance}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-0.5">
                📍 {lot.location}
              </p>

              <div className="grid grid-cols-2 gap-1.5 mb-3 text-xs border-y py-1.5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground">Price/Hr</span>
                  <span className="font-bold flex items-center text-primary"><IndianRupee className="w-3 h-3" />{lot.pricePerHour}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground">Available</span>
                  <span className="font-bold text-foreground">{lot.availableSlots}/{lot.totalSlots} Slots</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="flex-1 text-[11px] h-8 bg-gradient-primary hover:opacity-90 animate-in fade-in"
                  onClick={() => navigate(`/booking/${lot.id}`)}
                >
                  Book Slot
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  title="Simulate Navigation"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartNavigation(lot);
                  }}
                >
                  <Navigation className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Polyline Route path */}
      {routePath.length > 0 && (
        <Polyline
          positions={routePath}
          color="#2563eb"
          weight={5}
          opacity={0.8}
          dashArray="10, 10"
          lineCap="round"
        />
      )}
    </>
  );
};

export default function ParkingMap({ parkingLots }: ParkingMapProps) {
  const navigate = useNavigate();
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(USER_COORDS);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | undefined>(undefined);
  
  // Navigation State
  const [isNavigating, setIsNavigating] = useState(false);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [navigationSteps, setNavigationSteps] = useState<string[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [eta, setEta] = useState({ distanceKm: 0, durationMins: 0 });

  // Generate realistic route with curves / mock turns between User and Parking Lot
  const generateRoute = (lot: ParkingLot) => {
    const startLat = USER_COORDS[0];
    const startLng = USER_COORDS[1];
    const destLat = lot.lat;
    const destLng = lot.lng;

    // Create 2 intermediate points for street-like turns
    const p1Lat = startLat + (destLat - startLat) * 0.35 + (Math.random() - 0.5) * 0.003;
    const p1Lng = startLng + (destLng - startLng) * 0.2 + (Math.random() - 0.5) * 0.003;

    const p2Lat = startLat + (destLat - startLat) * 0.75 + (Math.random() - 0.5) * 0.003;
    const p2Lng = startLng + (destLng - startLng) * 0.8 + (Math.random() - 0.5) * 0.003;

    const route: [number, number][] = [
      USER_COORDS,
      [p1Lat, p1Lng],
      [p2Lat, p2Lng],
      [destLat, destLng]
    ];

    setRoutePath(route);

    // Calculate distance and time dynamically
    const rawDistance = Math.sqrt(Math.pow(destLat - startLat, 2) + Math.pow(destLng - startLng, 2)) * 111;
    const distanceKm = parseFloat(rawDistance.toFixed(1));
    const durationMins = Math.max(Math.round((distanceKm / 25) * 60), 2);
    setEta({ distanceKm, durationMins });

    // Generate standard steps
    const steps = [
      "Head North toward College Road from current location.",
      `Turn right onto Anna Salai/Mount Road (Go ${Math.round(distanceKm * 0.4 * 10) / 10} km).`,
      `Merge onto bypass road towards ${lot.location.split(",")[0]} (Go ${Math.round(distanceKm * 0.4 * 10) / 10} km).`,
      `Turn left in 100 meters. The destination, ${lot.name}, will be on your left.`,
      `Arrived! Park at the designated slots inside ${lot.name}.`
    ];
    setNavigationSteps(steps);
    setCurrentStepIdx(0);

    // Fit map bounds to show the entire route
    const bounds = L.latLngBounds([USER_COORDS, [lot.lat, lot.lng]]);
    setMapBounds(bounds);

    // Voice announcement for beginning navigation
    speakText(`Starting navigation to ${lot.name}. Total distance is ${distanceKm} kilometers. ETA ${durationMins} minutes.`, true);
  };

  // Text to speech function
  const speakText = (text: string, force = false) => {
    if (voiceMuted && !force) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartNavigation = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setIsNavigating(true);
    generateRoute(lot);
    toast.success(`Navigation started to ${lot.name}!`);
  };

  const handleNextStep = () => {
    if (currentStepIdx < navigationSteps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      speakText(navigationSteps[nextIdx]);
    } else {
      toast.success("You have arrived at your destination!");
      speakText("You have arrived at your destination. Thank you for using SmartPark.");
      setIsNavigating(false);
      setRoutePath([]);
    }
  };

  const handleExitNavigation = () => {
    setIsNavigating(false);
    setRoutePath([]);
    setMapBounds(undefined);
    setMapCenter(USER_COORDS);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    toast.info("Navigation ended.");
  };

  const openGoogleMaps = (lot: ParkingLot) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${USER_COORDS[0]},${USER_COORDS[1]}&destination=${lot.lat},${lot.lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const handleMarkerClick = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setMapCenter([lot.lat, lot.lng]);
    setMapBounds(undefined);
  };

  // Availability percentage calculation
  const getPercentage = (avail: number, total: number) => Math.round((avail / total) * 100);

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border bg-card">
      {/* Immersive Leaflet Map */}
      <MapContainer
        center={USER_COORDS}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapContent
          parkingLots={parkingLots}
          selectedLot={selectedLot}
          routePath={routePath}
          mapCenter={mapCenter}
          mapBounds={mapBounds}
          handleMarkerClick={handleMarkerClick}
          handleStartNavigation={handleStartNavigation}
        />
      </MapContainer>

      {/* Floating Info Overlay (User Location Details) */}
      <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur shadow-lg border rounded-lg px-3 py-2 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
        <span className="text-xs font-semibold text-foreground flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
          Location: Nungambakkam
        </span>
      </div>

      {/* Full Google-like Navigation Drawer Panel */}
      {isNavigating && selectedLot && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[380px] z-10 p-4 shadow-2xl border-2 border-primary bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-bold text-primary tracking-wider uppercase">Navigation Mode</span>
              <h3 className="font-extrabold text-base text-foreground leading-tight">{selectedLot.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => setVoiceMuted(!voiceMuted)}
                title={voiceMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
              >
                {voiceMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleExitNavigation}
              >
                Exit
              </Button>
            </div>
          </div>

          {/* Large Navigation Banner (Current Step) */}
          <div className="bg-emerald-600 text-white rounded-lg p-3.5 mb-3 flex items-start gap-2.5 shadow-md">
            <Compass className="w-6 h-6 shrink-0 mt-0.5 animate-pulse text-emerald-100" />
            <div className="flex-1">
              <p className="text-xs text-emerald-100 font-medium">Next Turn</p>
              <p className="text-sm font-bold leading-snug">{navigationSteps[currentStepIdx]}</p>
            </div>
          </div>

          {/* ETA & Statistics */}
          <div className="flex justify-between items-center text-xs bg-secondary rounded-lg p-2.5 mb-3 border">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">ETA</span>
              <span className="font-extrabold text-sm text-foreground flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-primary" />
                {eta.durationMins} mins
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Distance</span>
              <span className="font-extrabold text-sm text-foreground">
                {eta.distanceKm} km
              </span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-primary text-primary-foreground font-semibold hover:opacity-90 text-xs h-9"
              onClick={handleNextStep}
            >
              {currentStepIdx < navigationSteps.length - 1 ? "Next Instruction" : "Arrived!"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2 text-xs flex gap-1 items-center shrink-0 border-2"
              onClick={() => openGoogleMaps(selectedLot)}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Maps
            </Button>
          </div>
        </Card>
      )}

      {/* Selected Lot Panel (when map clicked, but not navigating) */}
      {!isNavigating && selectedLot && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[360px] z-10 p-4 shadow-2xl bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-foreground leading-tight">{selectedLot.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                📍 {selectedLot.location}
              </p>
            </div>
            <Badge variant={getPercentage(selectedLot.availableSlots, selectedLot.totalSlots) > 50 ? "success" : getPercentage(selectedLot.availableSlots, selectedLot.totalSlots) > 20 ? "warning" : "destructive"} className="text-xs font-semibold py-0.5">
              {getPercentage(selectedLot.availableSlots, selectedLot.totalSlots)}% Available
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs bg-secondary rounded-lg p-2.5 mb-3 border">
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground block">Available Slots</span>
              <span className="font-extrabold text-sm">{selectedLot.availableSlots} / {selectedLot.totalSlots}</span>
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground block">Distance</span>
              <span className="font-extrabold text-sm">{selectedLot.distance}</span>
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground block">Hourly Rate</span>
              <span className="font-extrabold text-sm flex items-center text-primary">
                <IndianRupee className="w-3.5 h-3.5" />
                {selectedLot.pricePerHour}/hr
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-gradient-primary hover:opacity-90 font-bold text-xs h-9"
              onClick={() => navigate(`/booking/${selectedLot.id}`)}
            >
              Book Slots Instantly
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2 text-xs flex gap-1.5 items-center border-2 border-primary text-primary font-bold hover:bg-primary/10"
              onClick={() => handleStartNavigation(selectedLot)}
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              Navigate
            </Button>
          </div>
        </Card>
      )}

      {/* Floating Instructions/Controls info for better UX */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-2.5 text-[11px] shadow-md border flex gap-1 items-center font-bold bg-background/90"
          onClick={() => {
            setMapCenter(USER_COORDS);
            setMapBounds(undefined);
            toast.info("Map centered to your location!");
          }}
        >
          <Compass className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          Center Location
        </Button>
      </div>
    </div>
  );
}
