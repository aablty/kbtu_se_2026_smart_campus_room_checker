import { describe, it, expect } from "vitest";
import { explainAvailability } from "@/lib/explainAdapter";
import type { ExplainRequest } from "@/lib/explainAdapter";

function makeRequest(overrides: Partial<ExplainRequest> = {}): ExplainRequest {
  return {
    roomLabel: "Room A",
    startLabel: "10:00",
    endLabel: "11:00",
    isAvailable: true,
    reasonCode: "available",
    ...overrides,
  };
}

const MAX_LEN = 240;

describe("explainAvailability", () => {
  it("E01: available — mentions the room, no invented facts", async () => {
    const res = await explainAvailability(makeRequest());
    expect(res.explanation).toContain("Room A");
    expect(res.explanation.length).toBeLessThanOrEqual(MAX_LEN);
  });

  it("E02: overlap — references the overlap reason", async () => {
    const res = await explainAvailability(makeRequest({ isAvailable: false, reasonCode: "overlap" }));
    expect(res.explanation).toMatch(/overlap/i);
  });

  it("E03: room-blocked", async () => {
    const res = await explainAvailability(makeRequest({ isAvailable: false, reasonCode: "room-blocked" }));
    expect(res.explanation).toMatch(/blocked/i);
  });

  it("E04: invalid-time", async () => {
    const res = await explainAvailability(makeRequest({ isAvailable: false, reasonCode: "invalid-time" }));
    expect(res.explanation).toMatch(/valid/i);
  });

  it("E05: start-in-past", async () => {
    const res = await explainAvailability(makeRequest({ isAvailable: false, reasonCode: "start-in-past" }));
    expect(res.explanation).toMatch(/passed/i);
  });

  it("E06: empty roomLabel -> safe fallback, no throw", async () => {
    const res = await explainAvailability(makeRequest({ roomLabel: "" }));
    expect(res.explanation).toMatch(/unavailable/i);
  });

  it("E07: overly long field -> safe fallback, no throw", async () => {
    const res = await explainAvailability(makeRequest({ roomLabel: "x".repeat(200) }));
    expect(res.explanation).toMatch(/unavailable/i);
  });

  it("E08: simulated timeout -> fallback within the deadline", async () => {
    const res = await explainAvailability(makeRequest(), { timeoutMs: 1 });
    expect(res.explanation).toMatch(/unavailable/i);
  });

  it("E09: unrecognized reasonCode (e.g. from an untrusted boundary) -> safe fallback, no throw", async () => {
    const res = await explainAvailability(
      makeRequest({ reasonCode: "not-a-real-code" as ExplainRequest["reasonCode"] }),
    );
    expect(res.explanation).toMatch(/unavailable/i);
  });
});
