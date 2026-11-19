import { describe, expect, it } from "vitest";

import { defaultInterval, formatTime, timeToMinutes } from "@/lib/time";

describe("time helpers", () => {
  it("accepts end-of-day 24:00", () => {
    expect(timeToMinutes("24:00")).toBe(1440);
    expect(formatTime(1440)).toBe("24:00");
  });

  it("rejects times after end of day", () => {
    expect(timeToMinutes("24:01")).toBeNull();
  });

  it("creates a deterministic one-hour interval from a fixed clock value", () => {
    expect(defaultInterval(540)).toEqual({ start: "09:30", end: "10:30" });
  });

  it("keeps the default interval inside the day near midnight", () => {
    expect(defaultInterval(1410)).toEqual({ start: "23:31", end: "24:00" });
  });
});
