import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, Clock, DoorOpen, Search } from "lucide-react";

import { RoomCard } from "@/components/RoomCard";
import { RoomFilters } from "@/components/RoomFilters";
import { EmptyState } from "@/components/EmptyState";
import { ResultBanner } from "@/components/ResultBanner";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { Timeline } from "@/components/Timeline";
import { RoomBookings } from "@/components/RoomBookings";

import { rooms as sampleRooms, EQUIPMENT_OPTIONS } from "@/lib/sampleData";
import { checkAvailability } from "@/lib/availability";
import { explainAvailability } from "@/lib/explainAdapter";
import { filterRooms } from "@/lib/filtering";
import { formatTime, timeToMinutes, nowDefault, defaultInterval } from "@/lib/time";
import type { CheckResult, Room, RoomFilters as RoomFiltersState } from "@/lib/types";
import { MAX_DURATION } from "@/lib/types";

const INITIAL_FILTERS: RoomFiltersState = { minAttendees: 0, requiredEquipment: [] };

function App() {
  const [rooms] = useState<Room[]>(sampleRooms);
  const [filters, setFilters] = useState<RoomFiltersState>(INITIAL_FILTERS);
  const [selectedId, setSelectedId] = useState<string>(rooms[0].id);
  const [nowMinutes, setNowMinutes] = useState<number>(nowDefault);
  const [startInput, setStartInput] = useState<string>(() => defaultInterval(nowMinutes).start);
  const [endInput, setEndInput] = useState<string>(() => defaultInterval(nowMinutes).end);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

  const visibleRooms = useMemo(() => filterRooms(rooms, filters), [rooms, filters]);

  // Bumped on every clearResult(), so a still-pending explainAvailability
  // response can detect it has gone stale and must not repaint the panel.
  const explainTokenRef = useRef(0);

  // Any input that invalidates the current result must also drop the
  // explanation, otherwise it keeps describing a result that no longer applies.
  const clearResult = () => {
    explainTokenRef.current += 1;
    setResult(null);
    setExplanation(null);
    setExplaining(false);
  };

  // F5: if the current selection is filtered out, fall back to the first
  // visible room (or none) and clear any stale availability result.
  useEffect(() => {
    if (!visibleRooms.some((r) => r.id === selectedId)) {
      setSelectedId(visibleRooms[0]?.id ?? "");
      clearResult();
    }
  }, [visibleRooms, selectedId]);

  const selectedRoom = useMemo(
    () => visibleRooms.find((r) => r.id === selectedId) ?? null,
    [visibleRooms, selectedId],
  );

  const startMinutes = timeToMinutes(startInput);
  const endMinutes = timeToMinutes(endInput);
  const duration =
    startMinutes != null && endMinutes != null ? endMinutes - startMinutes : null;

  const handleCheck = () => {
    clearResult();
    if (!selectedRoom) {
      setResult({ decision: "unavailable", reason: "Select a room first.", reasonCode: "invalid-time" });
      return;
    }
    if (startMinutes == null) {
      setResult({
        decision: "unavailable",
        reason: "Please enter valid start and end times.",
        reasonCode: "invalid-time",
      });
      return;
    }
    if (endMinutes == null) {
      setResult({
        decision: "unavailable",
        reason: "Enter the end time in HH:MM format. Use 24:00 for end of day.",
        reasonCode: "invalid-time",
      });
      return;
    }
    const res = checkAvailability(selectedRoom, startMinutes, endMinutes, nowMinutes);
    setResult(res);
  };

  const handleReset = () => {
    clearResult();
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedId(roomId);
    clearResult();
  };

  const handleExplain = async () => {
    if (!selectedRoom || !result || startMinutes == null || endMinutes == null) return;
    const token = ++explainTokenRef.current;
    setExplaining(true);
    const res = await explainAvailability({
      roomLabel: selectedRoom.name,
      startLabel: formatTime(startMinutes),
      endLabel: formatTime(endMinutes),
      isAvailable: result.decision === "available",
      reasonCode: result.reasonCode,
    });
    if (explainTokenRef.current !== token) return; // stale: input changed while awaiting
    setExplanation(res.explanation);
    setExplaining(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Smart Campus — Room Availability Checker
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Check whether a study room is free before you book it.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section aria-label="Room list" className="space-y-3">
            <RoomFilters filters={filters} equipmentOptions={EQUIPMENT_OPTIONS} onChange={setFilters} />

            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <DoorOpen className="h-4 w-4" />
              Rooms ({visibleRooms.length})
            </h2>
            {visibleRooms.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2.5">
                {visibleRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isSelected={room.id === selectedId}
                    onSelect={() => handleSelectRoom(room.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section aria-label="Availability checker" className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <label className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Clock className="h-4 w-4" />
                  Current time
                </span>
                <span className="flex items-center gap-2">
                  <input
                    type="time"
                    value={formatTime(nowMinutes)}
                    onChange={(e) => {
                      const m = timeToMinutes(e.target.value);
                      if (m != null) setNowMinutes(m);
                      clearResult();
                    }}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-400">({nowMinutes} min)</span>
                </span>
              </label>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <CalendarClock className="h-4 w-4" />
                Candidate booking interval
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="start-time"
                    className="mb-1 block text-xs font-medium text-slate-500"
                  >
                    Start time
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startInput}
                    onChange={(e) => {
                      setStartInput(e.target.value);
                      clearResult();
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Must be after current time ({formatTime(nowMinutes)}).
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="end-time"
                    className="mb-1 block text-xs font-medium text-slate-500"
                  >
                    End time
                  </label>
                  <input
                    id="end-time"
                    type="text"
                    inputMode="numeric"
                    placeholder="HH:MM (24:00 ok)"
                    value={endInput}
                    onChange={(e) => {
                      setEndInput(e.target.value);
                      clearResult();
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Max booking length: {MAX_DURATION} minutes. Use 24:00 for end of day.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs">
                {duration != null ? (
                  duration > 0 ? (
                    <span
                      className={[
                        "rounded-full px-2.5 py-0.5 font-medium",
                        duration > MAX_DURATION
                          ? "bg-red-100 text-red-700"
                          : "bg-sky-100 text-sky-700",
                      ].join(" ")}
                    >
                      Duration: {duration} min
                      {duration > MAX_DURATION ? ` (exceeds ${MAX_DURATION})` : ""}
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-700">
                      End must be after start
                    </span>
                  )
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-500">
                    Enter valid times
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                >
                  <Search className="h-4 w-4" />
                  Check availability
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleExplain}
                  disabled={!result || !selectedRoom || explaining}
                  className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Explain availability
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-600">
                Day timeline — {selectedRoom ? selectedRoom.name : "No room selected"}
              </h2>
              <div className="mt-4">
                <Timeline
                  bookings={selectedRoom?.bookings ?? []}
                  candidateStart={startMinutes}
                  candidateEnd={endMinutes}
                  nowMinutes={nowMinutes}
                />
              </div>
            </div>

            <ResultBanner result={result} />
            <ExplanationPanel explanation={explanation} loading={explaining} />

            {selectedRoom && <RoomBookings room={selectedRoom} />}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data · No real bookings are created or modified.
        </footer>
      </main>
    </div>
  );
}

export default App;
