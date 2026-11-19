import { describe, it, expect } from "vitest";
import { matchesCapacity, matchesEquipment, filterRooms } from "@/lib/filtering";
import type { Room } from "@/lib/types";

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "R1",
    name: "Room 1",
    building: "Test Building",
    capacity: 10,
    equipment: ["Whiteboard"],
    blocked: false,
    bookings: [],
    ...overrides,
  };
}

describe("matchesCapacity — F1", () => {
  it("F1a: room capacity exactly equal to requested attendees matches", () => {
    const room = makeRoom({ capacity: 10 });
    expect(matchesCapacity(room, 10)).toBe(true);
  });

  it("F1b: room capacity one below requested attendees does not match", () => {
    const room = makeRoom({ capacity: 9 });
    expect(matchesCapacity(room, 10)).toBe(false);
  });

  it("F1c: zero or unset attendee requirement matches any room", () => {
    const room = makeRoom({ capacity: 1 });
    expect(matchesCapacity(room, 0)).toBe(true);
  });
});

describe("matchesEquipment — F2", () => {
  it("F2a: room containing all required equipment matches", () => {
    const room = makeRoom({ equipment: ["Whiteboard", "Projector", "Computers"] });
    expect(matchesEquipment(room, ["Whiteboard", "Projector"])).toBe(true);
  });

  it("F2b: room missing one required item does not match", () => {
    const room = makeRoom({ equipment: ["Whiteboard"] });
    expect(matchesEquipment(room, ["Whiteboard", "Projector"])).toBe(false);
  });

  it("F2c: no required equipment selected matches any room", () => {
    const room = makeRoom({ equipment: [] });
    expect(matchesEquipment(room, [])).toBe(true);
  });
});

describe("filterRooms — F1+F2 combined, F3/F4 support", () => {
  const catalog: Room[] = [
    makeRoom({ id: "A", capacity: 24, equipment: ["Whiteboard", "Projector"], blocked: false }),
    makeRoom({ id: "B", capacity: 12, equipment: ["Whiteboard"], blocked: true }),
    makeRoom({ id: "C", capacity: 80, equipment: ["Projector", "Video Conferencing"], blocked: false }),
    makeRoom({ id: "D", capacity: 6, equipment: ["Whiteboard", "Computers"], blocked: false }),
  ];

  it("F1+F2a: filters by capacity and equipment together", () => {
    const result = filterRooms(catalog, { minAttendees: 20, requiredEquipment: ["Projector"] });
    expect(result.map((r) => r.id)).toEqual(["A", "C"]);
  });

  it("F1+F2b: returns every room when no filters are applied", () => {
    const result = filterRooms(catalog, { minAttendees: 0, requiredEquipment: [] });
    expect(result).toHaveLength(4);
  });

  it("F4: returns an empty array when no room satisfies the requirements (empty state trigger)", () => {
    const result = filterRooms(catalog, { minAttendees: 1000, requiredEquipment: [] });
    expect(result).toHaveLength(0);
  });

  it("F3 (catalog-level): a blocked room with matching capacity/equipment is still listed, so the UI can show it as Blocked rather than hiding it silently", () => {
    const result = filterRooms(catalog, { minAttendees: 10, requiredEquipment: ["Whiteboard"] });
    expect(result.map((r) => r.id)).toContain("B");
    expect(result.find((r) => r.id === "B")?.blocked).toBe(true);
  });
});
