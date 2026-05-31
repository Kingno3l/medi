export type ActionType = "EMERGENCY_BANNER" | "REDIRECT_NODE" | "RECOMMENDATION";

export interface TriageOption {
  label: string;
  next_node_id: string;
  filter_directives?: {
    type?: "hospital" | "pharmacy" | "urgent" | "all";
    specialty?: string;
  };
}

export interface TriageNode {
  node_id: string;
  question_text: string;
  action_type: ActionType;
  options?: Record<string, TriageOption>;
  payload?: {
    message: string;
    trigger_call?: boolean;
    recommended_type?: "hospital" | "pharmacy" | "urgent";
    recommended_specialty?: string;
  };
}

export const TRIAGE_GRAPH: Record<string, TriageNode> = {
  triage_root: {
    node_id: "triage_root",
    question_text: "What best describes your situation right now?",
    action_type: "REDIRECT_NODE",
    options: {
      chest_pain: {
        label: "Severe chest pain or difficulty breathing",
        next_node_id: "triage_stroke_emergency",
        filter_directives: { type: "hospital", specialty: "stroke" }
      },
      child_illness: {
        label: "Child or baby illness/injury",
        next_node_id: "triage_paediatric_emergency",
        filter_directives: { type: "hospital", specialty: "paediatric" }
      },
      maternity_emergency: {
        label: "Pregnancy or maternity emergency",
        next_node_id: "triage_maternity_emergency",
        filter_directives: { type: "hospital", specialty: "maternity" }
      },
      dental_pain: {
        label: "Toothache or dental emergency",
        next_node_id: "triage_dental_urgent",
        filter_directives: { type: "urgent", specialty: "dental" }
      },
      mental_health: {
        label: "Mental health crisis",
        next_node_id: "triage_mental_urgent",
        filter_directives: { type: "all", specialty: "mental" }
      },
      minor_injury: {
        label: "Minor injury or sudden illness",
        next_node_id: "triage_injury_triage"
      },
      medication: {
        label: "Medication question or refill",
        next_node_id: "triage_pharmacy_recommendation",
        filter_directives: { type: "pharmacy", specialty: "general" }
      }
    }
  },
  triage_injury_triage: {
    node_id: "triage_injury_triage",
    question_text: "Is there heavy bleeding, loss of consciousness, or a head injury?",
    action_type: "REDIRECT_NODE",
    options: {
      yes: {
        label: "Yes",
        next_node_id: "triage_general_emergency",
        filter_directives: { type: "hospital" }
      },
      no: {
        label: "No",
        next_node_id: "triage_general_urgent",
        filter_directives: { type: "urgent" }
      }
    }
  },
  triage_stroke_emergency: {
    node_id: "triage_stroke_emergency",
    question_text: "",
    action_type: "EMERGENCY_BANNER",
    payload: {
      message: "CRITICAL ALERT: Your symptoms may indicate a stroke or severe heart condition. Call 999 or 112 immediately. Do not attempt to drive.",
      trigger_call: true,
      recommended_type: "hospital",
      recommended_specialty: "stroke"
    }
  },
  triage_paediatric_emergency: {
    node_id: "triage_paediatric_emergency",
    question_text: "",
    action_type: "EMERGENCY_BANNER",
    payload: {
      message: "EMERGENCY ALERT: Child A&E is highly specialized. Call 999 immediately or head directly to the nearest Paediatric A&E unit.",
      trigger_call: true,
      recommended_type: "hospital",
      recommended_specialty: "paediatric"
    }
  },
  triage_maternity_emergency: {
    node_id: "triage_maternity_emergency",
    question_text: "",
    action_type: "EMERGENCY_BANNER",
    payload: {
      message: "EMERGENCY ALERT: For pregnancy-related crises, call 999 or proceed immediately to the nearest hospital with specialized Maternity services.",
      trigger_call: true,
      recommended_type: "hospital",
      recommended_specialty: "maternity"
    }
  },
  triage_general_emergency: {
    node_id: "triage_general_emergency",
    question_text: "",
    action_type: "EMERGENCY_BANNER",
    payload: {
      message: "CRITICAL ALERT: Please call 999 or 112 immediately for emergency medical assistance.",
      trigger_call: true,
      recommended_type: "hospital"
    }
  },
  triage_dental_urgent: {
    node_id: "triage_dental_urgent",
    question_text: "",
    action_type: "RECOMMENDATION",
    payload: {
      message: "Visit Urgent Care: Head to an urgent care center with dental facilities or call NHS 111 for out-of-hours dental rotas.",
      recommended_type: "urgent",
      recommended_specialty: "dental"
    }
  },
  triage_mental_urgent: {
    node_id: "triage_mental_urgent",
    question_text: "",
    action_type: "RECOMMENDATION",
    payload: {
      message: "Seek Support: Reach out to a local mental health crisis line or visit an urgent care facility equipped for psychiatric support.",
      recommended_type: "urgent",
      recommended_specialty: "mental"
    }
  },
  triage_general_urgent: {
    node_id: "triage_general_urgent",
    question_text: "",
    action_type: "RECOMMENDATION",
    payload: {
      message: "Visit Urgent Care: Your symptoms are best handled by an urgent care walk-in clinic or your GP.",
      recommended_type: "urgent"
    }
  },
  triage_pharmacy_recommendation: {
    node_id: "triage_pharmacy_recommendation",
    question_text: "",
    action_type: "RECOMMENDATION",
    payload: {
      message: "Visit a Pharmacy: A local pharmacist can consult on minor ailments and medication refilling. See the map for late-night rotas.",
      recommended_type: "pharmacy"
    }
  }
};
