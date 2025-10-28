"use client";

import { JobScreeningResult } from "@/types/job";

function levelColor(level: JobScreeningResult["riskLevel"]) {
  switch (level) {
    case "High Risk":
      return "border-red-500 bg-red-50 text-red-800";
    case "Caution":
      return "border-yellow-500 bg-yellow-50 text-yellow-800";
    default:
      return "border-emerald-500 bg-emerald-50 text-emerald-800";
  }
}

export default function ResultCard({ result }: { result: JobScreeningResult }) {
  return (
    <div className={`w-full border rounded-xl p-4 sm:p-6 ${levelColor(result.riskLevel)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Risk: {result.riskLevel}</h2>
        <div className="text-sm sm:text-base font-medium">Score: {result.score}/100</div>
      </div>
      <p className="mt-2 text-sm sm:text-base">{result.summary}</p>

      {result.factors.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Reasons</h3>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm sm:text-base">
            {result.factors.map((f) => (
              <li key={f.code + (f.details || "")}>{f.label}{f.details ? ` — ${f.details}` : ""}</li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Suggestions</h3>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm sm:text-base">
            {result.suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
