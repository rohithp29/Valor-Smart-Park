import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wrench,
  AlertTriangle,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle,
  MapPin,
  Activity,
  UserX,
  FileSpreadsheet
} from "lucide-react";

interface MaintenanceLog {
  id: string;
  type: "barrier_fault" | "idle_vehicle" | "wrong_slot";
  title: string;
  location: string;
  description: string;
  slotAllocated: string;
  slotParked: string;
  userName: string;
  vehicleNumber: string;
  priority: "critical" | "high" | "medium";
  status: "active" | "in_progress" | "resolved" | "under_review";
  reportedAt: string;
}

const DEFAULT_LOGS: MaintenanceLog[] = [
  {
    id: "m-101",
    type: "barrier_fault",
    title: "Faulty Barrier",
    location: "Anna Nagar Tower Parking",
    description: "Entrance barrier gate #2 servo motor is jammed and fails to raise automatically upon ticket validation.",
    slotAllocated: "-",
    slotParked: "-",
    userName: "-",
    vehicleNumber: "-",
    priority: "high",
    status: "in_progress",
    reportedAt: "2026-05-18T09:30:00Z",
  },
  {
    id: "m-102",
    type: "idle_vehicle",
    title: "Idle Vehicle (> 3 Days)",
    location: "T Nagar Shopping Complex",
    description: "Verna Sedan has been parked in a premium EV slot for 4 consecutive days without charging session activity.",
    slotAllocated: "F1-45",
    slotParked: "F1-12",
    userName: "Rajesh Kumar",
    vehicleNumber: "TN-07-CM-4433",
    priority: "medium",
    status: "active",
    reportedAt: "2026-05-16T14:20:00Z",
  },
  {
    id: "m-103",
    type: "wrong_slot",
    title: "Wrong Slot Parking Violation",
    location: "Marina Beach Parking",
    description: "Driver parked in a designated disabled/family slot near the elevator instead of their booked standard slot.",
    slotAllocated: "F1-22",
    slotParked: "F1-04",
    userName: "Anita Sen",
    vehicleNumber: "TN-02-AK-9922",
    priority: "critical",
    status: "active",
    reportedAt: "2026-05-19T08:15:00Z",
  },
  {
    id: "m-104",
    type: "wrong_slot",
    title: "Wrong Slot Parking Violation",
    location: "Express Avenue Mall",
    description: "Bike parked in a designated electric vehicle charging slot on Floor 2.",
    slotAllocated: "F1-08",
    slotParked: "F2-15",
    userName: "Vijay Ram",
    vehicleNumber: "TN-09-XX-8877",
    priority: "high",
    status: "active",
    reportedAt: "2026-05-19T09:45:00Z",
  },
  {
    id: "m-105",
    type: "barrier_fault",
    title: "FASTag Reader Error",
    location: "Poonamalle Metro Parking",
    description: "Exit lane automatic scanner camera is unable to detect linked FASTag RFIDs, causing queue blockages.",
    slotAllocated: "-",
    slotParked: "-",
    userName: "-",
    vehicleNumber: "-",
    priority: "critical",
    status: "under_review",
    reportedAt: "2026-05-19T10:10:00Z",
  }
];

const AdminMaintenance = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [newType, setNewType] = useState<"barrier_fault" | "idle_vehicle" | "wrong_slot">("barrier_fault");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAllocated, setNewAllocated] = useState("");
  const [newParked, setNewParked] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [newPriority, setNewPriority] = useState<"critical" | "high" | "medium">("medium");

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem("admin_maintenance_logs");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate existing Rajesh Kumar log if it has matching slots to respect user feedback
      const migrated = parsed.map((log: any) => {
        if (log.id === "m-102" && log.slotAllocated === log.slotParked) {
          return { ...log, slotAllocated: "F1-45", slotParked: "F1-12" };
        }
        return log;
      });
      setLogs(migrated);
      localStorage.setItem("admin_maintenance_logs", JSON.stringify(migrated));
    } else {
      localStorage.setItem("admin_maintenance_logs", JSON.stringify(DEFAULT_LOGS));
      setLogs(DEFAULT_LOGS);
    }
  }, []);

  const saveLogs = (updatedLogs: MaintenanceLog[]) => {
    localStorage.setItem("admin_maintenance_logs", JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim() || !newDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill out the title, location, and description fields.",
        variant: "destructive",
      });
      return;
    }

    if (newType !== "barrier_fault" && newAllocated.trim().toUpperCase() === newParked.trim().toUpperCase()) {
      toast({
        title: "Validation Error",
        description: "For compliance issues and wrong slot violations, the allocated slot and parked slot must be different.",
        variant: "destructive",
      });
      return;
    }

    const newLog: MaintenanceLog = {
      id: `m-${Date.now()}`,
      type: newType,
      title: newTitle,
      location: newLocation,
      description: newDescription,
      slotAllocated: newType === "barrier_fault" ? "-" : newAllocated || "-",
      slotParked: newType === "barrier_fault" ? "-" : newParked || "-",
      userName: newType === "barrier_fault" ? "-" : newUserName || "-",
      vehicleNumber: newType === "barrier_fault" ? "-" : newVehicle || "-",
      priority: newPriority,
      status: "active",
      reportedAt: new Date().toISOString(),
    };

    const updated = [newLog, ...logs];
    saveLogs(updated);
    setIsCreateOpen(false);
    toast({
      title: "Log Entry Created",
      description: "Successfully added new maintenance log to the registry.",
    });

    // Reset fields
    setNewTitle("");
    setNewLocation("");
    setNewDescription("");
    setNewAllocated("");
    setNewParked("");
    setNewUserName("");
    setNewVehicle("");
    setNewPriority("medium");
  };

  const handleUpdateStatus = (id: string, nextStatus: "active" | "in_progress" | "resolved" | "under_review") => {
    const updated = logs.map((log) => {
      if (log.id === id) {
        return { ...log, status: nextStatus };
      }
      return log;
    });
    saveLogs(updated);
    toast({
      title: "Status Updated",
      description: `Log entry status changed to '${nextStatus.replace("_", " ")}'.`,
    });
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((log) => log.id !== id);
    saveLogs(updated);
    toast({
      title: "Log Deleted",
      description: "Successfully removed the maintenance log.",
    });
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterType === "all" || log.type === filterType;
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 hover:bg-red-600 text-white font-bold";
      case "high":
        return "bg-amber-500 hover:bg-amber-600 text-white font-bold";
      default:
        return "bg-slate-500 hover:bg-slate-600 text-white font-bold";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "resolved":
        return "outline";
      case "in_progress":
        return "secondary";
      case "under_review":
        return "outline";
      default:
        return "destructive";
    }
  };

  const counts = {
    total: logs.length,
    critical: logs.filter((l) => l.priority === "critical").length,
    equipment: logs.filter((l) => l.type === "barrier_fault").length,
    violations: logs.filter((l) => l.type === "wrong_slot" || l.type === "idle_vehicle").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Maintenance & Compliance Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track hardware hardware faults, idle overstays, and incorrect slot parking violations.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-purple-600 font-bold gap-2">
              <Plus className="w-4 h-4" /> Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Report Maintenance/Compliance Issue</DialogTitle>
              <DialogDescription>
                Create a new alert entry to track hardware failure or customer parking violations.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateLog} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="issue-type">Log Category</Label>
                  <select
                    id="issue-type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-10 border rounded-md px-3 bg-background text-sm font-medium focus:ring-2 focus:ring-ring"
                  >
                    <option value="barrier_fault">Barrier/Hardware Fault</option>
                    <option value="idle_vehicle">Idle Overstay (&gt; 3 Days)</option>
                    <option value="wrong_slot">Wrong Slot Violation</option>
                  </select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Faulty Barrier Gate #2"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="location">Parking Lot Name</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Anna Nagar Tower Parking"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                  />
                </div>

                {newType !== "barrier_fault" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="allocated">Slot Allocated</Label>
                      <Input
                        id="allocated"
                        placeholder="e.g. F1-22"
                        value={newAllocated}
                        onChange={(e) => setNewAllocated(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parked">Slot Parked</Label>
                      <Input
                        id="parked"
                        placeholder="e.g. F1-04"
                        value={newParked}
                        onChange={(e) => setNewParked(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-name">User Name</Label>
                      <Input
                        id="user-name"
                        placeholder="e.g. Anita Sen"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Vehicle Plate</Label>
                      <Input
                        id="vehicle"
                        placeholder="e.g. TN-02-AK-9922"
                        value={newVehicle}
                        onChange={(e) => setNewVehicle(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="priority">Severity Level</Label>
                  <select
                    id="priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-10 border rounded-md px-3 bg-background text-sm font-medium focus:ring-2 focus:ring-ring"
                  >
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Severity</option>
                  </select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter visual clues or technical logs..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 font-bold mt-2">
                Submit Alert Log
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active logs tracked</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{counts.critical}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Urgent response needed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gate Barrier Faults</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{counts.equipment}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Hardware repairs pending</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations & Overstay</CardTitle>
            <UserX className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{counts.violations}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Wrong slot / Idle cars</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <Card className="shadow-sm border">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              size="sm"
            >
              All Logs
            </Button>
            <Button
              variant={filterType === "barrier_fault" ? "default" : "outline"}
              onClick={() => setFilterType("barrier_fault")}
              size="sm"
              className="gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" /> Hardware
            </Button>
            <Button
              variant={filterType === "wrong_slot" ? "default" : "outline"}
              onClick={() => setFilterType("wrong_slot")}
              size="sm"
              className="gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Wrong Slot
            </Button>
            <Button
              variant={filterType === "idle_vehicle" ? "default" : "outline"}
              onClick={() => setFilterType("idle_vehicle")}
              size="sm"
              className="gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Idle Vehicles
            </Button>
          </div>

          <div className="flex gap-2 w-full md:max-w-xs">
            <Search className="w-5 h-5 text-muted-foreground mt-2.5 ml-2 absolute" />
            <Input
              placeholder="Search by lot, user, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLogs.length === 0 ? (
          <Card className="text-center py-12 border shadow-sm">
            <CardContent className="flex flex-col items-center gap-3">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <CardTitle>All Clear!</CardTitle>
              <CardDescription>No maintenance faults or compliance violations found matching this criteria.</CardDescription>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 gap-4 border-b bg-slate-50/50">
                <div className="flex items-start md:items-center gap-3">
                  <div className={`p-2.5 rounded-lg border ${
                    log.type === "barrier_fault" ? "bg-blue-50 text-blue-600 border-blue-100" :
                    log.type === "wrong_slot" ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                    "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {log.type === "barrier_fault" ? <Wrench className="w-5 h-5" /> :
                     log.type === "wrong_slot" ? <AlertTriangle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-lg">{log.title}</span>
                      <Badge className={getPriorityBadgeColor(log.priority)}>
                        {log.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(log.status)}>
                        {log.status.toUpperCase().replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-semibold text-slate-700">{log.location}</span>
                      <span className="text-xs">• Reported {new Date(log.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <select
                    value={log.status}
                    onChange={(e) => handleUpdateStatus(log.id, e.target.value as any)}
                    className="h-9 text-xs font-semibold border rounded-md px-2 bg-background focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Active Alert</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border">
                  {log.description}
                </p>

                {log.type !== "barrier_fault" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-muted-foreground block uppercase font-bold tracking-wider mb-0.5">User Name</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-primary" /> {log.userName}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block uppercase font-bold tracking-wider mb-0.5">Vehicle License</span>
                      <span className="font-bold text-slate-800 font-mono">{log.vehicleNumber}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block uppercase font-bold tracking-wider mb-0.5">Slot Allocated</span>
                      <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 inline-block font-mono">
                        {log.slotAllocated}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block uppercase font-bold tracking-wider mb-0.5">Slot Parked</span>
                      <span className={`font-bold px-2 py-0.5 rounded border inline-block font-mono ${
                        log.slotParked === log.slotAllocated ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"
                      }`}>
                        {log.slotParked}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMaintenance;
