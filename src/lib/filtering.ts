import type { Room, RoomFilters } from "./types";

/** F1: room capacity must be >= requested attendees. */
export function matchesCapacity(room: Room, minAttendees: number): boolean {
  if (!Number.isFinite(minAttendees) || minAttendees <= 0) return true;
  return room.capacity >= minAttendees;
}

/** F2: room must contain ALL selected required equipment items. */
export function matchesEquipment(room: Room, requiredEquipment: string[]): boolean {
  if (requiredEquipment.length === 0) return true;
  return requiredEquipment.every((item) => room.equipment.includes(item));
}

/**
 * F1 + F2: filters a room catalog down to rooms satisfying the user's
 * selected capacity/equipment requirements. Blocked rooms are intentionally
 * NOT excluded here — they remain visible (marked "Blocked" in the UI) so a
 * user can see why a room isn't bookable; F3 ("a blocked room cannot be
 * reported as available") is enforced in checkAvailability instead, which
 * already refuses to approve a booking for a blocked room.
 */
export function filterRooms(rooms: Room[], filters: RoomFilters): Room[] {
  return rooms.filter(
    (room) =>
      matchesCapacity(room, filters.minAttendees) &&
      matchesEquipment(room, filters.requiredEquipment),
  );
}
