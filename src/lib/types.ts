export interface Booking {
  id: string;
  start: number;
  end: number;
  title: string;
  bookedBy: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
}

export interface RoomFilters {
  minAttendees: number;
  requiredEquipment: string[];
}

export type Decision = "available" | "unavailable";

export type ReasonCode =
  | "available"
  | "invalid-time"
  | "start-before-day"
  | "end-after-day"
  | "start-after-end"
  | "start-in-past"
  | "duration-exceeded"
  | "room-blocked"
  | "overlap";

export interface CheckResult {
  decision: Decision;
  reason: string;
  reasonCode: ReasonCode;
}

export const MINUTE_MAX = 1440;
export const MAX_DURATION = 120;
