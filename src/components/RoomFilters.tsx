import { Users, Wrench } from "lucide-react";
import type { RoomFilters as RoomFiltersState } from "@/lib/types";

interface RoomFiltersProps {
  filters: RoomFiltersState;
  equipmentOptions: readonly string[];
  onChange: (filters: RoomFiltersState) => void;
}

export function RoomFilters({ filters, equipmentOptions, onChange }: RoomFiltersProps) {
  const toggleEquipment = (item: string) => {
    const next = filters.requiredEquipment.includes(item)
      ? filters.requiredEquipment.filter((e) => e !== item)
      : [...filters.requiredEquipment, item];
    onChange({ ...filters, requiredEquipment: next });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <Users className="h-4 w-4" />
        Requirements
      </h2>

      <div className="mt-3">
        <label htmlFor="min-attendees" className="mb-1 block text-xs font-medium text-slate-500">
          Minimum attendees
        </label>
        <input
          id="min-attendees"
          type="number"
          min={0}
          value={filters.minAttendees || ""}
          placeholder="0"
          onChange={(e) =>
            onChange({ ...filters, minAttendees: Math.max(0, Number(e.target.value) || 0) })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div className="mt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Wrench className="h-3.5 w-3.5" />
          Required equipment
        </p>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const active = filters.requiredEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => toggleEquipment(item)}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-300 bg-white text-slate-600 hover:border-sky-300",
                ].join(" ")}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
