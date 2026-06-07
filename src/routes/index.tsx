import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { MapPin, PhoneCall, MessageSquare, Hospital, Pill, Stethoscope, LayoutGrid, X, ShieldAlert, ArrowUpDown, Wifi, WifiOff, RefreshCw, ServerCrash, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_RESOURCES, SPECIALTIES, type Resource, type ResourceType, type Specialty } from "@/lib/mock-data";
import { ResourceMap } from "@/components/ResourceMap";
import { ResourceList } from "@/components/ResourceList";
import { TriageChatbot } from "@/components/TriageChatbot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EmergencyCard } from "@/components/EmergencyCard";
import { ProjectInfo } from "@/components/ProjectInfo";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const FILTERS: { id: ResourceType | "all"; label: string; icon: typeof Hospital }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "hospital", label: "Hospitals", icon: Hospital },
  { id: "urgent", label: "Urgent care", icon: Stethoscope },
  { id: "pharmacy", label: "Pharmacies", icon: Pill },
];

type SortKey = "distance" | "wait";

function Dashboard() {
  const [resources, setResources] = useState<Resource[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("mediconnect_resources");
      return cached ? JSON.parse(cached) : MOCK_RESOURCES;
    }
    return MOCK_RESOURCES;
  });

  const [filter, setFilter] = useState<ResourceType | "all">("all");
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "nhs" | "private">("all");
  const [sortKey, setSortKey] = useState<SortKey>("distance");
  const [selectedId, setSelectedId] = useState<string | null>("r1");
  const [showChat, setShowChat] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Offline and Low Signal Simulation State
  const [isOffline, setIsOffline] = useState(false);
  const [chatFiltered, setChatFiltered] = useState(false);

  // Server cold-start wake-ping state
  const [serverStatus, setServerStatus] = useState<"unknown" | "waking" | "online" | "offline">("unknown");

  // Ping the backend health endpoint on mount to wake the Render.com server
  useEffect(() => {
    if (isOffline) return;
    const API_BASE =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://medi-kamsi.onrender.com";

    setServerStatus("waking");
    const controller = new AbortController();
    const wakeTimeout = setTimeout(() => setServerStatus("waking"), 2000);

    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then((r) => {
        clearTimeout(wakeTimeout);
        setServerStatus(r.ok ? "online" : "offline");
      })
      .catch(() => {
        clearTimeout(wakeTimeout);
        setServerStatus("offline");
      });

    return () => { controller.abort(); clearTimeout(wakeTimeout); };
  }, [isOffline]);

  // Sync resources state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mediconnect_resources", JSON.stringify(resources));
    }
  }, [resources]);

  // Fetch resources from the local Express backend on load
  const fetchResourcesFromBackend = async () => {
    try {
      // Default coordinates centered on Bristol Royal Infirmary (Mock coordinate center)
      const lat = 51.4594;
      const lng = -2.5984;
      
      const API_BASE = typeof window !== "undefined" && 
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? "http://localhost:5000"
          : "https://medi-kamsi.onrender.com";

      const response = await fetch(`${API_BASE}/api/v2/resources?lat=${lat}&lng=${lng}&radius=5000`);
      const json = await response.json();
      if (json.status === "success" && json.data) {
        setResources(json.data);
        setLastRefreshed(new Date());
        setServerStatus("online");
        console.log("[SUCCESS] Successfully loaded live resources from MediConnect Backend Server!");
      }
    } catch (err) {
      console.warn("[WARNING] API Server offline. Operating in Fail-Safe Local Cache Mode.", err);
    }
  };

  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (!isOffline) {
      fetchResourcesFromBackend();
      // Auto-refresh wait times every 60 seconds
      const interval = setInterval(fetchResourcesFromBackend, 60_000);
      return () => clearInterval(interval);
    }
  }, [isOffline]);

  // Listen to browser network changes
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleReportWaitTime = async (id: string, waitMinutes: number) => {
    // 1. Instantly update local state for fast responsive UI
    setResources((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, waitMinutes, verifiedMinutesAgo: 0 } : r
      )
    );

    // 2. Synchronize the report back to the Express database
    try {
      const API_BASE = typeof window !== "undefined" && 
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? "http://localhost:5000"
          : "https://medi-kamsi.onrender.com";

      await fetch(`${API_BASE}/api/v2/resources/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facility_id: id, wait_minutes: waitMinutes })
      });
      console.log("[SUCCESS] Synchronized crowdsourced wait-time report with central database.");
    } catch (err) {
      console.warn("[WARNING] Central database sync failed. Storing update locally.", err);
    }
  };

  const handleChatFilterChange = (f: ResourceType | "all") => {
    setFilter(f);
    setChatFiltered(true);
  };

  const handleChatSpecialtyChange = (s: Specialty | null) => {
    setSpecialty(s);
    setChatFiltered(true);
  };

  const resetAllFilters = () => {
    setFilter("all");
    setSpecialty(null);
    setPaymentFilter("all");
    setChatFiltered(false);
  };

  const filtered = useMemo(() => {
    let result = [...resources]
      .filter((r) => filter === "all" || r.type === filter)
      .filter((r) => !specialty || r.specialties.includes(specialty))
      .filter((r) => paymentFilter === "all" || r.paymentModel === paymentFilter)
      .sort((a, b) =>
        sortKey === "distance" ? a.distance - b.distance : a.waitMinutes - b.waitMinutes
      );

    // In offline mode, only show the nearest 5 cached items
    if (isOffline) {
      result = result.slice(0, 5);
    }
    return result;
  }, [resources, filter, specialty, paymentFilter, sortKey, isOffline]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="flex items-center justify-between bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-amber-950 shadow-inner">
          <div className="flex items-center gap-1.5 mx-auto">
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
            <span>Low Signal / Offline Mode Active. Showing nearest 5 cached facilities only.</span>
          </div>
          <button 
            onClick={() => setIsOffline(false)} 
            className="text-[10px] underline hover:text-white"
          >
            Re-connect
          </button>
        </div>
      )}

      {/* Server cold-start warning banner */}
      {!isOffline && serverStatus === "waking" && (
        <div className="flex items-center justify-center gap-2 bg-sky-500/10 border-b border-sky-500/20 px-4 py-1 text-xs text-sky-700 dark:text-sky-400">
          <Zap className="h-3 w-3 animate-pulse" />
          <span>Waking up the backend server — this may take up to 30 seconds on first load…</span>
        </div>
      )}
      {!isOffline && serverStatus === "offline" && (
        <div className="flex items-center justify-center gap-2 bg-red-500/10 border-b border-red-500/20 px-4 py-1 text-xs text-red-700 dark:text-red-400">
          <ServerCrash className="h-3 w-3" />
          <span>Backend server unreachable. Displaying cached local data.</span>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Hospital className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">MediConnect</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Bristol, UK · 2.5 km radius
              <span
                title={
                  serverStatus === "online"
                    ? "Backend online"
                    : serverStatus === "waking"
                    ? "Server waking up…"
                    : serverStatus === "offline"
                    ? "Backend offline — using cache"
                    : ""
                }
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  serverStatus === "online" && "bg-emerald-500",
                  serverStatus === "waking" && "bg-amber-400 animate-pulse",
                  serverStatus === "offline" && "bg-red-500",
                  serverStatus === "unknown" && "bg-muted-foreground/30",
                )}
              />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Low Signal Simulation Toggle */}
          <button
            onClick={() => setIsOffline((o) => !o)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-all",
              isOffline
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
            title="Simulate low signal or offline"
          >
            {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isOffline ? "Offline Sim" : "Online"}</span>
          </button>

          <ThemeToggle />
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setShowInfo(true)} title="Project Info">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => setShowCard(true)}>
            <ShieldAlert className="h-4 w-4" /> My card
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => setShowChat((s) => !s)}>
            <MessageSquare className="h-4 w-4" /> Triage
          </Button>
          <Button size="sm" variant="destructive">
            <PhoneCall className="h-4 w-4" /> Call 999
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[380px_1fr] lg:grid-cols-[380px_1fr_360px]">
        <aside className="flex flex-col overflow-hidden border-b border-border bg-card md:border-b-0 md:border-r">
          
          {/* Chatbot Auto-Filtering Notice Banner */}
          {chatFiltered && (
            <div className="flex items-center justify-between bg-primary/5 px-4 py-2 border-b border-border text-[11px] animate-fade-in">
              <span className="text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-primary" />
                Auto-filtered by <strong>Triage Assistant</strong>
              </span>
              <button
                onClick={resetAllFilters}
                className="font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Nearby facilities</h2>
              <p className="text-xs text-muted-foreground">
                {filtered.length} found {isOffline ? "in cache" : "within radius"}
                {lastRefreshed && !isOffline && (
                  <span className="ml-1 text-muted-foreground/60">
                    · updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setSortKey((k) => (k === "distance" ? "wait" : "distance"))}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortKey === "distance" ? "Distance" : "Wait time"}
            </button>
          </div>

          {/* Core Resource Type Filters */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setFilter(f.id);
                    if (f.id === "all") setChatFiltered(false);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* NHS vs Private Segment Selector */}
          <div className="flex items-center gap-1 border-b border-border px-3 py-1.5 bg-muted/20 text-xs">
            <span className="text-muted-foreground mr-1">Care model:</span>
            <div className="inline-flex rounded-md border border-border bg-background p-0.5 shadow-sm">
              <button
                onClick={() => setPaymentFilter("all")}
                className={cn(
                  "rounded-sm px-2 py-0.5 text-[10px] font-medium transition-colors",
                  paymentFilter === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              <button
                onClick={() => setPaymentFilter("nhs")}
                className={cn(
                  "rounded-sm px-2 py-0.5 text-[10px] font-medium transition-colors",
                  paymentFilter === "nhs" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                NHS
              </button>
              <button
                onClick={() => setPaymentFilter("private")}
                className={cn(
                  "rounded-sm px-2 py-0.5 text-[10px] font-medium transition-colors",
                  paymentFilter === "private" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Private
              </button>
            </div>
          </div>

          {/* Specialty chips */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
            <button
              onClick={() => {
                setSpecialty(null);
                setChatFiltered(false);
              }}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                !specialty
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              Any specialty
            </button>
            {SPECIALTIES.map((s) => {
              const active = specialty === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSpecialty(active ? null : s.id);
                    setChatFiltered(false);
                  }}
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            <ResourceList 
              resources={filtered} 
              selectedId={selectedId} 
              onSelect={setSelectedId} 
              onReportWaitTime={handleReportWaitTime}
            />
          </div>
        </aside>

        <main className="relative min-h-[320px] p-3 md:p-4">
          <ResourceMap 
            resources={filtered} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            isOffline={isOffline}
          />
          {/* SVG map disclaimer */}
          <p className="absolute bottom-5 right-5 text-[10px] text-muted-foreground/50 select-none pointer-events-none">
            Schematic map · Not real cartography
          </p>
        </main>

        <aside className="hidden flex-col overflow-hidden border-l border-border bg-card lg:flex">
          <TriageChatbot 
            onFilterChange={handleChatFilterChange} 
            onSpecialtyChange={handleChatSpecialtyChange}
          />
        </aside>
      </div>

      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm lg:hidden">
          <div className="flex h-[85vh] w-full flex-col rounded-t-xl border-t border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-medium">Triage assistant</span>
              <Button size="icon" variant="ghost" onClick={() => setShowChat(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TriageChatbot 
                onFilterChange={handleChatFilterChange} 
                onSpecialtyChange={handleChatSpecialtyChange}
              />
            </div>
          </div>
        </div>
      )}

      <EmergencyCard open={showCard} onClose={() => setShowCard(false)} />
      <ProjectInfo open={showInfo} onClose={() => setShowInfo(false)} />

      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        aria-label="Open triage chat"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </div>
  );
}
