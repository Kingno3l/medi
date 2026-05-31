import { Hospital, Pill, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { waitTone, type Resource, type ResourceType } from "@/lib/mock-data";

const ICONS: Record<ResourceType, typeof Hospital> = {
  hospital: Hospital,
  pharmacy: Pill,
  urgent: Stethoscope,
};

const COLORS: Record<ResourceType, string> = {
  hospital: "bg-hospital text-white",
  pharmacy: "bg-pharmacy text-white",
  urgent: "bg-urgent text-white",
};

const DOT_TONE = {
  low: "bg-emerald-500",
  med: "bg-amber-500",
  high: "bg-red-500",
} as const;

interface Props {
  resources: Resource[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isOffline?: boolean;
}

export function ResourceMap({ resources, selectedId, onSelect, isOffline }: Props) {
  return (
    <div className={cn(
      "relative h-full w-full overflow-hidden rounded-lg border transition-colors",
      isOffline ? "border-amber-500/25 bg-[oklch(0.98_0.01_60)] dark:bg-[oklch(0.23_0.02_60)]" : "border-border bg-[oklch(0.97_0.005_240)] dark:bg-[oklch(0.22_0.01_240)]"
    )}>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: isOffline
            ? "linear-gradient(oklch(0.94 0.01 60 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.94 0.01 60 / 0.5) 1px, transparent 1px)"
            : "linear-gradient(oklch(0.93 0.005 240 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.93 0.005 240 / 0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,55 Q30,45 50,52 T100,48" stroke={isOffline ? "oklch(0.89 0.01 60 / 0.5)" : "oklch(0.88 0.005 240 / 0.6)"} strokeWidth="1.4" fill="none" />
        <path d="M48,0 Q52,40 50,55 T46,100" stroke={isOffline ? "oklch(0.89 0.01 60 / 0.5)" : "oklch(0.88 0.005 240 / 0.6)"} strokeWidth="1.4" fill="none" />
      </svg>

      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-primary/5",
          isOffline ? "border-amber-500/20" : "border-primary/30"
        )}
        style={{ width: "70%", height: "70%" }}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-white" />
      </div>

      {isOffline && (
        <div className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 shadow-sm backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          OFFLINE CACHE MAP
        </div>
      )}

      {resources.map((r) => {
        const Icon = ICONS[r.type];
        const selected = selectedId === r.id;
        const tone = waitTone(r.waitMinutes);
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 transition-transform",
              selected ? "z-20" : "z-10 hover:scale-105",
            )}
          >
            <div className="relative">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full shadow-sm ring-2 ring-white",
                  COLORS[r.type],
                  selected && "ring-4 ring-primary/40",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "absolute -right-1 -top-1 h-3 w-3 rounded-full ring-2 ring-white",
                  DOT_TONE[tone],
                )}
                aria-label={`${r.waitMinutes} min wait`}
              />
            </div>
            {selected && (
              <div className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-md border border-border bg-popover p-2 text-left shadow-md">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-foreground truncate">{r.name}</p>
                  <span className={cn(
                    "shrink-0 inline-flex items-center rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider",
                    r.paymentModel === "nhs" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  )}>
                    {r.paymentModel}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{r.distance} m · {r.waitMinutes} min wait</p>
              </div>
            )}
          </button>
        );
      })}

      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 rounded-md border border-border bg-card/95 p-2 text-xs shadow-sm">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Wait time</p>
        <LegendItem color="bg-emerald-500" label="Under 20 min" />
        <LegendItem color="bg-amber-500" label="20–60 min" />
        <LegendItem color="bg-red-500" label="Over 1 hour" />
      </div>

      <div className="absolute right-3 top-3 rounded-md border border-border bg-card/95 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
        {isOffline ? "Offline Cached Radius" : "2,500 m radius · live"}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      <span className="text-foreground">{label}</span>
    </div>
  );
}
