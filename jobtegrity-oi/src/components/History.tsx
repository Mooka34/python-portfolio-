"use client";

import { JobInput, JobScreeningResult } from "@/types/job";

export interface HistoryItem {
  id: string;
  job: JobInput;
  result: JobScreeningResult;
  at: string; // ISO
}

export default function History({ items, onLoad, onClear }: {
  items: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Recent analyses</h3>
        <button className="text-sm underline" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Risk</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-b-0">
                <td className="py-2 pr-4 whitespace-nowrap">{new Date(item.at).toLocaleString()}</td>
                <td className="py-2 pr-4">{item.job.title}</td>
                <td className="py-2 pr-4">{item.job.companyName}</td>
                <td className="py-2 pr-4">{item.result.riskLevel}</td>
                <td className="py-2 pr-4">{item.result.score}</td>
                <td className="py-2 pr-4">
                  <button className="text-sm underline" onClick={() => onLoad(item)}>
                    Load
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
