import { useState } from "react";
import { Bot, User, PhoneCall, Stethoscope, Pill, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResourceType, Specialty } from "@/lib/mock-data";

type ResultType = "emergency" | "urgent" | "pharmacy";

interface Option {
  label: string;
  next: string;
  filter?: ResourceType | "all";
  specialty?: Specialty;
}

interface TriageNode {
  id: string;
  question: string;
  options?: Option[];
  result?: ResultType;
}

const TRIAGE: Record<string, TriageNode> = {
  start: {
    id: "start",
    question: "What best describes your situation right now?",
    options: [
      { label: "Severe chest pain or difficulty breathing", next: "r_stroke_emergency", filter: "hospital", specialty: "stroke" },
      { label: "Child or baby illness/injury", next: "r_paediatric", filter: "hospital", specialty: "paediatric" },
      { label: "Pregnancy or maternity emergency", next: "r_maternity", filter: "hospital", specialty: "maternity" },
      { label: "Toothache or dental emergency", next: "r_dental", filter: "urgent", specialty: "dental" },
      { label: "Mental health crisis", next: "r_mental", filter: "all", specialty: "mental" },
      { label: "Minor injury or sudden illness", next: "q_injury" },
      { label: "Medication question or refill", next: "r_pharmacy", filter: "pharmacy", specialty: "general" },
    ],
  },
  q_injury: {
    id: "q_injury",
    question: "Is there heavy bleeding, loss of consciousness, or a head injury?",
    options: [
      { label: "Yes", next: "r_emergency", filter: "hospital", specialty: "general" },
      { label: "No", next: "r_urgent", filter: "urgent", specialty: "general" },
    ],
  },
  r_stroke_emergency: { id: "r_stroke_emergency", question: "", result: "emergency" },
  r_paediatric: { id: "r_paediatric", question: "", result: "emergency" },
  r_maternity: { id: "r_maternity", question: "", result: "emergency" },
  r_dental: { id: "r_dental", question: "", result: "urgent" },
  r_mental: { id: "r_mental", question: "", result: "urgent" },
  r_emergency: { id: "r_emergency", question: "", result: "emergency" },
  r_urgent: { id: "r_urgent", question: "", result: "urgent" },
  r_pharmacy: { id: "r_pharmacy", question: "", result: "pharmacy" },
};

interface Message {
  from: "bot" | "user";
  text: string;
}

interface TriageChatbotProps {
  onFilterChange?: (filter: ResourceType | "all") => void;
  onSpecialtyChange?: (specialty: Specialty | null) => void;
}

export function TriageChatbot({ onFilterChange, onSpecialtyChange }: TriageChatbotProps) {
  const [nodeId, setNodeId] = useState("start");
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: TRIAGE.start.question },
  ]);

  const node = TRIAGE[nodeId];

  const choose = (opt: Option) => {
    const next = TRIAGE[opt.next];
    const newMsgs: Message[] = [...messages, { from: "user", text: opt.label }];
    if (next.question) newMsgs.push({ from: "bot", text: next.question });
    setMessages(newMsgs);
    setNodeId(opt.next);

    // Apply auto filters
    if (opt.filter && onFilterChange) {
      onFilterChange(opt.filter);
    }
    if (opt.specialty && onSpecialtyChange) {
      onSpecialtyChange(opt.specialty === "general" ? null : opt.specialty);
    }
  };

  const reset = () => {
    setNodeId("start");
    setMessages([{ from: "bot", text: TRIAGE.start.question }]);
    if (onFilterChange) onFilterChange("all");
    if (onSpecialtyChange) onSpecialtyChange(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Triage assistant</p>
            <p className="text-xs text-muted-foreground">Signposting only — not a diagnosis</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={reset} className="h-8 gap-1 text-xs">
          <RotateCcw className="h-3 w-3" /> Restart
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.from === "user" && "flex-row-reverse")}>
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                m.from === "bot" ? "bg-primary/10 text-primary" : "bg-muted text-foreground",
              )}
            >
              {m.from === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                m.from === "bot"
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}

        {node.result && <TriageResult result={node.result} />}
      </div>

      {node.options && (
        <div className="space-y-2 border-t border-border p-3">
          {node.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => choose(opt)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TriageResult({ result }: { result: ResultType }) {
  if (result === "emergency") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-semibold">Call emergency services</p>
        </div>
        <p className="mt-1.5 text-sm text-foreground">
          Your symptoms may indicate a medical emergency. Call 999 or 112 immediately.
        </p>
        <Button className="mt-3 w-full" variant="destructive">
          <PhoneCall className="h-4 w-4" /> Call 999
        </Button>
      </div>
    );
  }
  if (result === "urgent") {
    return (
      <div className="rounded-md border border-urgent/30 bg-urgent/5 p-3">
        <div className="flex items-center gap-2 text-urgent">
          <Stethoscope className="h-4 w-4" />
          <p className="text-sm font-semibold">Visit urgent care</p>
        </div>
        <p className="mt-1.5 text-sm text-foreground">
          Head to your nearest urgent care centre or GP. See the side panel for options.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-pharmacy/30 bg-pharmacy/5 p-3">
      <div className="flex items-center gap-2 text-pharmacy">
        <Pill className="h-4 w-4" />
        <p className="text-sm font-semibold">Visit a pharmacy</p>
      </div>
      <p className="mt-1.5 text-sm text-foreground">
        A pharmacist can help. The nearest 24-hour pharmacy is shown on the map.
      </p>
    </div>
  );
}
