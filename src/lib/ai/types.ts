// ── Shared types for the 4-agent interview pipeline ──────────────────────────

export interface Company {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  slug: string;
  userId: string;
}

export interface Metric {
  raw: string;
  type: "time" | "money" | "percentage" | "count";
  value: string;
  context: string;
}

export type Emotion =
  | "positive"
  | "negative"
  | "neutral"
  | "frustrated"
  | "excited"
  | "relieved";

export interface InterviewContext {
  problem: string | null;
  impact: string | null;
  transformation: string | null;
  recommendation: string | null;
  detectedEmotion: Emotion;
  warmthLevel: number;
  metrics: Metric[];
  completeness: number;
  readyForAgent3: boolean;
}

export interface AssistantMessage {
  role: "assistant";
  question: string;
  options: { id: string; text: string }[];
  detectedEmotion: Emotion;
  metricsFound: Metric[];
  completeness: number;
}

export interface UserMessage {
  role: "user";
  answer: string;
  selectedOptionId: string | null;
}

export type Message = AssistantMessage | UserMessage;

export interface Agent1Response {
  question: string | null;
  detectedEmotion: Emotion;
  metricsFound: Metric[];
  missingInfo: string[];
  completeness: number;
  ready: boolean;
  summary?: {
    problem: string;
    impact: string;
    transformation: string;
    recommendation: string;
    emotion: Emotion;
    warmthLevel: number;
    metrics: Metric[];
  };
}

export interface Agent2Response {
  options: { id: string; text: string }[];
}

export interface Agent3Response {
  testimonial: string;
  attribution: {
    name: string;
    role: string;
    company: string;
  };
  starRating: number;
  formats: {
    website: string;
    linkedin: string;
    social: string;
    caseStudy: string;
  };
  highlightedMetrics: { text: string; type: string }[];
}

export interface Agent4Response {
  passed: boolean;
  score: number;
  issues: string[];
  verdict: "PASS" | "FAIL";
  feedback: string;
  suggestions: string[];
}

export interface InterviewSession {
  id: string;
  slug: string;
  companyId: string;
  company: Company;
  customerName: string;
  customerEmail: string;
  messages: Message[];
  context: InterviewContext;
  status: "active" | "completed" | "abandoned";
  testimonialId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export const EMPTY_CONTEXT: InterviewContext = {
  problem: null,
  impact: null,
  transformation: null,
  recommendation: null,
  detectedEmotion: "neutral",
  warmthLevel: 5,
  metrics: [],
  completeness: 0,
  readyForAgent3: false,
};

export function createEmptyContext(): InterviewContext {
  return { ...EMPTY_CONTEXT, metrics: [] };
}

function formatMessages(messages: Message[]): string {
  return messages
    .map((m) => {
      if (m.role === "assistant") {
        return `INTERVIEWER: ${m.question}`;
      }
      return `CUSTOMER: ${m.answer}`;
    })
    .join("\n");
}

export { formatMessages };
