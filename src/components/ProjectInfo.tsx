import { X, GraduationCap, User, Calendar, BookOpen, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProjectInfo({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Project Metadata</h2>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 p-5 text-sm">
          <div className="text-center pb-2">
            <h3 className="text-lg font-bold text-foreground">MediConnect</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Emergency Healthcare Locator & Triage System
            </p>
          </div>

          <div className="space-y-3.5">
            <Row icon={User} label="Candidate" value="Kamsi Apugo" />
            <Row icon={Building} label="Institution" value="University of Bristol" />
            <Row icon={BookOpen} label="Course" value="MSc Final Year Project" />
            <Row icon={Calendar} label="Academic Year" value="2025 – 2026" />
          </div>

          <div className="rounded-md border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground text-center">
            Developed as a graduation requirement for the Faculty of Engineering.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4.5 w-4.5 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-foreground text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
