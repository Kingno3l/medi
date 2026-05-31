import { useState } from "react";
import { Hospital, Pill, Stethoscope, Phone, Clock, MapPin, Navigation, CheckCircle2, Accessibility, PhoneOutgoing, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SPECIALTIES, waitTone, type Resource, type ResourceType } from "@/lib/mock-data";

const ICONS: Record<ResourceType, typeof Hospital> = {
  hospital: Hospital,
  pharmacy: Pill,
  urgent: Stethoscope,
};

const TYPE_LABEL: Record<ResourceType, string> = {
  hospital: "Hospital",
  pharmacy: "Pharmacy",
  urgent: "Urgent care",
};

const TYPE_COLOR: Record<ResourceType, string> = {
  hospital: "bg-hospital/10 text-hospital",
  pharmacy: "bg-pharmacy/10 text-pharmacy",
  urgent: "bg-urgent/10 text-urgent",
};

const WAIT_TONE = {
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  med: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  high: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
} as const;

interface Props {
  resources: Resource[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReportWaitTime?: (id: string, waitMinutes: number) => void;
}

export function ResourceList({ resources, selectedId, onSelect, onReportWaitTime }: Props) {
  const [reportingId, setReportingId] = useState<string | null>(null);

  const handleReport = (id: string, mins: number) => {
    if (onReportWaitTime) {
      onReportWaitTime(id, mins);
    }
    setReportingId(null);
  };

  if (resources.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        No facilities match your filters.
      </div>
    );
  }
  return (
    <ul className="flex flex-col">
      {resources.map((r, i) => {
        const Icon = ICONS[r.type];
        const selected = selectedId === r.id;
        const tone = waitTone(r.waitMinutes);
        return (
          <li key={r.id}>
            <button
              onClick={() => onSelect(r.id)}
              className={cn(
                "w-full px-4 py-3 text-left transition-colors",
                i !== 0 && "border-t border-border",
                selected ? "bg-accent" : "hover:bg-muted/60",
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", TYPE_COLOR[r.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="truncate text-sm font-medium text-foreground">{r.name}</h3>
                      <span className={cn(
                        "shrink-0 inline-flex items-center rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider",
                        r.paymentModel === "nhs" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      )}>
                        {r.paymentModel}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {r.distance < 1000 ? `${r.distance} m` : `${(r.distance / 1000).toFixed(1)} km`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{TYPE_LABEL[r.type]}</p>

                  {/* Live signals */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium", WAIT_TONE[tone])}>
                      <Timer className="h-3 w-3" />
                      {r.type === "pharmacy" ? `~${r.waitMinutes} min queue` : `${r.waitMinutes} min wait`}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {r.verifiedMinutesAgo === 0 ? "Verified by you just now" : `Verified ${r.verifiedMinutesAgo}m ago`}
                    </span>
                    {r.callAhead && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[11px] text-primary">
                        <PhoneOutgoing className="h-3 w-3" /> Call-ahead
                      </span>
                    )}
                    {r.accessible && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        <Accessibility className="h-3 w-3" /> Step-free
                      </span>
                    )}
                  </div>

                  {r.specialties.filter((s) => s !== "general").length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {r.specialties
                        .filter((s) => s !== "general")
                        .map((s) => (
                          <span key={s} className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {SPECIALTIES.find((x) => x.id === s)?.label}
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.address}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.hours}</span>
                  </div>
                  {r.stockNote && (
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">{r.stockNote}</p>
                  )}

                  {selected && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="default" className="h-8">
                          <Phone className="h-3.5 w-3.5" /> Call
                        </Button>
                        {r.callAhead && (
                          <Button size="sm" variant="secondary" className="h-8">
                            <PhoneOutgoing className="h-3.5 w-3.5" /> Call ahead
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-8">
                          <Navigation className="h-3.5 w-3.5" /> Directions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportingId(reportingId === r.id ? null : r.id);
                          }}
                        >
                          <Timer className="h-3.5 w-3.5" /> Report Wait
                        </Button>
                      </div>

                      {reportingId === r.id && (
                        <div
                          className="mt-3 w-full rounded-md border border-border bg-card p-2.5 text-xs text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="font-medium text-foreground">Are you currently here? Report the wait:</p>
                          <div className="mt-2 grid grid-cols-4 gap-1.5">
                            <button
                              onClick={() => handleReport(r.id, 15)}
                              className="rounded border border-border bg-muted/40 py-1 text-center font-medium transition-colors hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500/20 dark:hover:text-emerald-400"
                            >
                              &lt;20m
                            </button>
                            <button
                              onClick={() => handleReport(r.id, 45)}
                              className="rounded border border-border bg-muted/40 py-1 text-center font-medium transition-colors hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-500/20 dark:hover:text-amber-400"
                            >
                              20-60m
                            </button>
                            <button
                              onClick={() => handleReport(r.id, 90)}
                              className="rounded border border-border bg-muted/40 py-1 text-center font-medium transition-colors hover:bg-red-500/10 hover:text-red-700 hover:border-red-500/20 dark:hover:text-red-400"
                            >
                              1-2h
                            </button>
                            <button
                              onClick={() => handleReport(r.id, 150)}
                              className="rounded border border-border bg-muted/40 py-1 text-center font-medium transition-colors hover:bg-red-700/10 hover:text-red-900 hover:border-red-700/20 dark:hover:text-red-400"
                            >
                              2h+
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
