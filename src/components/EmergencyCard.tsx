import { useState, useEffect } from "react";
import { X, ShieldAlert, User, Phone, HeartPulse, PillBottle, AlertCircle, Pencil, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface EmergencyProfile {
  name: string;
  conditions: string;
  medications: string;
  allergies: string;
  bloodType: string;
  nhsNumber: string;
  organDonor: boolean;
  emergencyContact: string;
  emergencyPhone: string;
}

const DEFAULT_PROFILE: EmergencyProfile = {
  name: "",
  conditions: "",
  medications: "",
  allergies: "",
  bloodType: "",
  nhsNumber: "",
  organDonor: false,
  emergencyContact: "",
  emergencyPhone: "",
};

const STORAGE_KEY = "mediconnect_emergency_profile";

function loadProfile(): EmergencyProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function EmergencyCard({ open, onClose }: Props) {
  const [profile, setProfile] = useState<EmergencyProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EmergencyProfile>(DEFAULT_PROFILE);

  // Load from localStorage on open
  useEffect(() => {
    if (open) {
      const saved = loadProfile();
      setProfile(saved);
      setDraft(saved);
      // If no data yet, drop straight into edit mode
      if (!saved.name) setEditing(true);
    }
  }, [open]);

  const handleSave = () => {
    setProfile(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setEditing(false);
  };

  const handleDiscard = () => {
    setDraft(profile);
    setEditing(false);
  };

  const isBlank = !profile.name;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-destructive/5 px-4 py-3">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="text-sm font-semibold">Emergency card</h2>
          </div>
          <div className="flex items-center gap-1">
            {!editing ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => { setDraft(profile); setEditing(true); }}
                title="Edit your emergency profile"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                onClick={handleSave}
                title="Save profile"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 p-4 text-sm max-h-[80vh] overflow-y-auto">
          {/* Info notice */}
          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {editing
                ? "Fill in your medical profile. This is stored only on this device."
                : "Show this to a paramedic or clinician. Stored locally on this device only."}
            </span>
          </div>

          {/* Blank state */}
          {isBlank && !editing && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No profile yet. Click <Pencil className="inline h-3 w-3" /> to add your information.
            </p>
          )}

          {/* View mode */}
          {!editing && !isBlank && (
            <>
              <Row icon={User} label="Name" value={profile.name || "—"} />
              <Row icon={HeartPulse} label="Conditions" value={profile.conditions || "—"} />
              <Row icon={PillBottle} label="Medication" value={profile.medications || "—"} />
              <Row icon={AlertCircle} label="Allergies" value={profile.allergies || "—"} />
              <Row icon={Phone} label="Emergency contact" value={profile.emergencyContact ? `${profile.emergencyContact} · ${profile.emergencyPhone}` : "—"} />
              <div className="rounded-md border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
                Blood type: {profile.bloodType || "—"} · NHS no. {profile.nhsNumber || "—"} · Organ donor: {profile.organDonor ? "yes" : "no"}
              </div>
            </>
          )}

          {/* Edit mode */}
          {editing && (
            <div className="space-y-2.5">
              <Field label="Full name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="e.g. Jane Smith" />
              <Field label="Medical conditions" value={draft.conditions} onChange={(v) => setDraft({ ...draft, conditions: v })} placeholder="e.g. Asthma · Type 1 diabetes" />
              <Field label="Current medications" value={draft.medications} onChange={(v) => setDraft({ ...draft, medications: v })} placeholder="e.g. Salbutamol · Insulin" />
              <Field label="Allergies" value={draft.allergies} onChange={(v) => setDraft({ ...draft, allergies: v })} placeholder="e.g. Penicillin, latex" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Blood type" value={draft.bloodType} onChange={(v) => setDraft({ ...draft, bloodType: v })} placeholder="e.g. O+" />
                <Field label="NHS number" value={draft.nhsNumber} onChange={(v) => setDraft({ ...draft, nhsNumber: v })} placeholder="e.g. 485 777 3456" />
              </div>
              <Field label="Emergency contact name" value={draft.emergencyContact} onChange={(v) => setDraft({ ...draft, emergencyContact: v })} placeholder="e.g. Jamie Smith" />
              <Field label="Emergency contact phone" value={draft.emergencyPhone} onChange={(v) => setDraft({ ...draft, emergencyPhone: v })} placeholder="e.g. +44 7700 900123" />
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.organDonor}
                  onChange={(e) => setDraft({ ...draft, organDonor: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-border"
                />
                Registered organ donor
              </label>
              <div className="flex gap-2 pt-1">
                <Button className="flex-1" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Save profile
                </Button>
                {!isBlank && (
                  <Button variant="outline" onClick={handleDiscard}>
                    Discard
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Call button — only shown in view mode when profile exists */}
          {!editing && !isBlank && (
            <Button className="w-full" variant="destructive">
              <Phone className="h-4 w-4" /> Call 999 and share location
            </Button>
          )}
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
