import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, PhoneCall, MessageSquare, Hospital, Pill, Stethoscope, LayoutGrid, X, ShieldAlert, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_RESOURCES, SPECIALTIES, type ResourceType, type Specialty } from "@/lib/mock-data";
import { ResourceMap } from "@/components/ResourceMap";
import { ResourceList } from "@/components/ResourceList";
import { TriageChatbot } from "@/components/TriageChatbot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EmergencyCard } from "@/components/EmergencyCard";

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
  const [filter, setFilter] = useState<ResourceType | "all">("all");
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("distance");
  const [selectedId, setSelectedId] = useState<string | null>("r1");
  const [showChat, setShowChat] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const filtered = useMemo(() => {
    return [...MOCK_RESOURCES]
      .filter((r) => filter === "all" || r.type === filter)
      .filter((r) => !specialty || r.specialties.includes(specialty))
      .sort((a, b) =>
        sortKey === "distance" ? a.distance - b.distance : a.waitMinutes - b.waitMinutes,
      );
  }, [filter, specialty, sortKey]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Hospital className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">MediConnect</h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              London, UK · 2.5 km radius
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
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
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Nearby facilities</h2>
              <p className="text-xs text-muted-foreground">{filtered.length} found within radius</p>
            </div>
            <button
              onClick={() => setSortKey((k) => (k === "distance" ? "wait" : "distance"))}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortKey === "distance" ? "Distance" : "Wait time"}
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
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

          <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
            <button
              onClick={() => setSpecialty(null)}
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
                  onClick={() => setSpecialty(active ? null : s.id)}
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
            <ResourceList resources={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </aside>

        <main className="min-h-[320px] p-3 md:p-4">
          <ResourceMap resources={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </main>

        <aside className="hidden flex-col overflow-hidden border-l border-border bg-card lg:flex">
          <TriageChatbot />
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
              <TriageChatbot />
            </div>
          </div>
        </div>
      )}

      <EmergencyCard open={showCard} onClose={() => setShowCard(false)} />

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
