import { Sparkles } from "lucide-react";

interface ExplanationPanelProps {
  explanation: string | null;
  loading: boolean;
}

export function ExplanationPanel({ explanation, loading }: ExplanationPanelProps) {
  if (!loading && !explanation) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <Sparkles className="h-5 w-5 shrink-0 text-violet-600" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-500">
          Generated explanation — not a booking decision
        </p>
        <p className="mt-1 text-sm text-violet-700">
          {loading ? "Generating explanation…" : explanation}
        </p>
      </div>
    </div>
  );
}
