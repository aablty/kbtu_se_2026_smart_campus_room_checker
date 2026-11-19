import type { ReasonCode } from "./types";

// mock adapter — no network call, no API key; swap the body for a server
// fetch("/api/explain") when a real key exists. Request fields are treated
// as untrusted plain data: read only, never interpolated into anything
// executed.

export interface ExplainRequest {
  roomLabel: string;
  startLabel: string;
  endLabel: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export interface ExplainResponse {
  explanation: string;
}

const MAX_FIELD_LENGTH = 120;
const FALLBACK: ExplainResponse = {
  explanation: "Explanation unavailable right now. See the status above for the confirmed result.",
};

const TEMPLATES: Record<ReasonCode, (r: ExplainRequest) => string> = {
  available: (r) => `${r.roomLabel} is free for ${r.startLabel}–${r.endLabel}. You can book this slot.`,
  "invalid-time": () => "The entered time could not be understood. Please re-enter a valid start and end time.",
  "start-before-day": () => "The start time is before 00:00, so it is not a valid time of day.",
  "end-after-day": () => "The end time goes past 24:00, so it is not a valid time of day.",
  "start-after-end": () => "The start time is not before the end time, so the interval is invalid.",
  "start-in-past": (r) => `${r.startLabel} has already passed, so ${r.roomLabel} cannot be booked for that start time.`,
  "duration-exceeded": (r) => `The requested interval for ${r.roomLabel} is longer than the 120-minute limit.`,
  "room-blocked": (r) => `${r.roomLabel} is currently blocked and cannot be booked for ${r.startLabel}–${r.endLabel}.`,
  overlap: (r) => `${r.roomLabel} is already booked during part of ${r.startLabel}–${r.endLabel}, so this interval overlaps an existing booking.`,
};

function isValid(request: ExplainRequest): boolean {
  const fields = [request.roomLabel, request.startLabel, request.endLabel];
  return fields.every((f) => f.trim().length > 0 && f.length <= MAX_FIELD_LENGTH);
}

export async function explainAvailability(
  request: ExplainRequest,
  opts: { timeoutMs?: number } = {},
): Promise<ExplainResponse> {
  if (!isValid(request)) return FALLBACK;

  const timeoutMs = opts.timeoutMs ?? 3000;
  const work = new Promise<ExplainResponse>((resolve) => {
    setTimeout(() => resolve({ explanation: TEMPLATES[request.reasonCode](request) }), 150);
  });
  const timeout = new Promise<ExplainResponse>((resolve) => {
    setTimeout(() => resolve(FALLBACK), timeoutMs);
  });

  return Promise.race([work, timeout]);
}
