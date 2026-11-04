import { MINUTE_MAX } from "./types";

export function formatTime(minutes: number): string {
  if (minutes >= MINUTE_MAX) return "24:00";
  const m = ((minutes % MINUTE_MAX) + MINUTE_MAX) % MINUTE_MAX;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

export function timeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h === 24 && m === 0) return MINUTE_MAX;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function nowDefault(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function defaultInterval(now: number): { start: string; end: string } {
  let start = now + 30;
  let end = start + 60;
  if (end > MINUTE_MAX) {
    end = MINUTE_MAX;
    start = end - 60;
  }
  if (start <= now) {
    start = now + 1;
    end = Math.min(start + 60, MINUTE_MAX);
  }
  return { start: formatTime(start), end: formatTime(end) };
}
