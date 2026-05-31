import { X, ShieldAlert, User, Phone, HeartPulse, PillBottle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EmergencyCard({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border bg-destructive/5 px-4 py-3">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="text-sm font-semibold">Emergency card</h2>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 p-4 text-sm">
          <p className="text-xs text-muted-foreground">
            Show this to a paramedic or clinician. Stored locally on this device only.
          </p>
          <Row icon={User} label="Name" value="Alex Morgan" />
          <Row icon={HeartPulse} label="Conditions" value="Asthma · Type 1 diabetes" />
          <Row icon={PillBottle} label="Medication" value="Salbutamol inhaler · Insulin (Novorapid)" />
          <Row icon={AlertCircle} label="Allergies" value="Penicillin" />
          <Row icon={Phone} label="Emergency contact" value="Jamie Morgan · +44 7700 900123" />
          <div className="rounded-md border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
            Blood type: O+ · NHS no. 485 777 3456 · Organ donor: yes
          </div>
          <Button className="w-full" variant="destructive">
            <Phone className="h-4 w-4" /> Call 999 and share location
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    </div>
  );
}
