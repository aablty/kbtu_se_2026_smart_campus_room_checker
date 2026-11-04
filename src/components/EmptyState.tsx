import { SearchX } from "lucide-react";

export function EmptyState() {
  return (
    <div
      role="status"
      className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500"
    >
      <SearchX className="mx-auto mb-2 h-6 w-6 text-slate-400" />
      No rooms match your current requirements. Try lowering the attendee count or removing an
      equipment filter.
    </div>
  );
}
