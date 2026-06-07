import { useState, useEffect, useRef } from "react";
import { Bot, User, PhoneCall, Stethoscope, Pill, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResourceType, Specialty } from "@/lib/mock-data";

type ResultType = "emergency" | "urgent" | "pharmacy";

interface Message {
  from: "bot" | "user";
  text: string;
}

interface TriageOption {
  key: string;
  label: string;
}

interface TriageState {
  node_id: string;
  question_text: string | null;
  action_type: "EMERGENCY_BANNER" | "REDIRECT_NODE" | "RECOMMENDATION";
  options: TriageOption[] | null;
  auto_filter_directives?: {
    type?: ResourceType | "all";
    specialty?: string;
  } | null;
  payload?: {
    message: string;
    trigger_call?: boolean;
    recommended_type?: ResourceType;
    recommended_specialty?: string;
  } | null;
}

// Resolve action type to a result type for the UI
function actionToResult(actionType: string): ResultType | null {
  if (actionType === "EMERGENCY_BANNER") return "emergency";
  if (actionType === "RECOMMENDATION") return "urgent"; // overridden by payload
  return null;
}

function getResultFromPayload(payload: TriageState["payload"]): ResultType {
  if (!payload) return "urgent";
  return payload.recommended_type === "pharmacy" ? "pharmacy" : "urgent";
}

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://medi-kamsi.onrender.com";

interface TriageChatbotProps {
  onFilterChange?: (filter: ResourceType | "all") => void;
  onSpecialtyChange?: (specialty: Specialty | null) => void;
}

export function TriageChatbot({ onFilterChange, onSpecialtyChange }: TriageChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentState, setCurrentState] = useState<TriageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, currentState]);

  // Fetch the start node from backend on mount
  const initTriage = async () => {
    setLoading(true);
    setApiError(false);
    setMessages([]);
    setCurrentState(null);
    try {
      const res = await fetch(`${API_BASE}/api/v2/triage/start`);
      if (!res.ok) throw new Error("Start node fetch failed");
      const data = await res.json();
      const startState: TriageState = {
        node_id: data.node_id,
        question_text: data.question_text,
        action_type: "REDIRECT_NODE",
        options: data.options,
        auto_filter_directives: null,
        payload: null,
      };
      setCurrentState(startState);
      setMessages([{ from: "bot", text: data.question_text }]);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initTriage();
  }, []);

  const handleChoose = async (option: TriageOption) => {
    if (!currentState || stepLoading) return;

    // Optimistically append user message
    setMessages((prev) => [...prev, { from: "user", text: option.label }]);
    setStepLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v2/triage/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_node_id: currentState.node_id,
          user_selection: option.key,
        }),
      });
      if (!res.ok) throw new Error("Step failed");
      const data = await res.json();

      const nextState: TriageState = {
        node_id: data.next_node_id,
        question_text: data.question_text,
        action_type: data.action_type,
        options: data.options,
        auto_filter_directives: data.auto_filter_directives,
        payload: data.payload,
      };

      // Apply auto-filter directives to the map sidebar
      if (data.auto_filter_directives) {
        const d = data.auto_filter_directives;
        if (d.type && onFilterChange) onFilterChange(d.type as ResourceType | "all");
        if (d.specialty && onSpecialtyChange)
          onSpecialtyChange(d.specialty === "general" ? null : (d.specialty as Specialty));
      }

      // Append the bot's follow-up question if any
      if (data.question_text) {
        setMessages((prev) => [...prev, { from: "bot", text: data.question_text }]);
      }

      setCurrentState(nextState);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I couldn't connect to the triage engine. Please try again." },
      ]);
    } finally {
      setStepLoading(false);
    }
  };

  const handleReset = () => {
    if (onFilterChange) onFilterChange("all");
    if (onSpecialtyChange) onSpecialtyChange(null);
    initTriage();
  };

  // Determine result type for terminal nodes
  const result: ResultType | null =
    currentState && currentState.action_type !== "REDIRECT_NODE"
      ? currentState.action_type === "EMERGENCY_BANNER"
        ? "emergency"
        : getResultFromPayload(currentState.payload)
      : null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
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
        <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 gap-1 text-xs">
          <RotateCcw className="h-3 w-3" /> Restart
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {/* Loading skeleton */}
        {loading && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Connecting to triage engine…
            </div>
          </div>
        )}

        {/* API error fallback */}
        {apiError && !loading && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-semibold mb-1">Triage engine offline</p>
            <p className="text-xs text-foreground">The triage server is unavailable. Please call 999 for emergencies or NHS 111 for urgent advice.</p>
            <Button className="mt-2 w-full" size="sm" variant="destructive" onClick={initTriage}>
              <RotateCcw className="h-3.5 w-3.5" /> Retry connection
            </Button>
          </div>
        )}

        {/* Conversation messages */}
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
                m.from === "bot" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Step loading indicator */}
        {stepLoading && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analysing…</span>
            </div>
          </div>
        )}

        {/* Terminal result card */}
        {result && currentState?.payload && <TriageResult result={result} message={currentState.payload.message} />}
      </div>

      {/* Options panel */}
      {!loading && !apiError && currentState?.options && currentState.options.length > 0 && !stepLoading && (
        <div className="space-y-2 border-t border-border p-3">
          {currentState.options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleChoose(opt)}
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

function TriageResult({ result, message }: { result: ResultType; message: string }) {
  if (result === "emergency") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-semibold">Call emergency services</p>
        </div>
        <p className="mt-1.5 text-sm text-foreground">{message}</p>
        <Button className="mt-3 w-full" variant="destructive">
          <PhoneCall className="h-4 w-4" /> Call 999
        </Button>
      </div>
    );
  }
  if (result === "urgent") {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Stethoscope className="h-4 w-4" />
          <p className="text-sm font-semibold">Visit urgent care</p>
        </div>
        <p className="mt-1.5 text-sm text-foreground">{message}</p>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
        <Pill className="h-4 w-4" />
        <p className="text-sm font-semibold">Visit a pharmacy</p>
      </div>
      <p className="mt-1.5 text-sm text-foreground">{message}</p>
    </div>
  );
}
