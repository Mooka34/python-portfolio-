"use client";

import { useState, useEffect } from "react";
import JobForm from "@/components/JobForm";
import ResultCard from "@/components/ResultCard";
import History, { HistoryItem } from "@/components/History";
import { JobInput } from "@/types/job";
import { screenJob } from "@/lib/screening/engine";

export default function Home() {
  const [result, setResult] = useState<ReturnType<typeof screenJob> | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jobtegrity_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("jobtegrity_history", JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [history]);

  function analyze(job: JobInput) {
    const r = screenJob(job);
    setResult(r);
    setHistory((prev) => [
      { id: `${Date.now()}`, job, result: r, at: new Date().toISOString() },
      ...prev,
    ].slice(0, 20));
  }

  return (
    <div className="font-sans min-h-screen p-5 sm:p-8 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Jobtegrity.oi</h1>
        <p className="text-sm opacity-80">Screen job posts for scam signals</p>
      </header>

      <main className="grid gap-6">
        <section>
          <JobForm onAnalyze={analyze} />
        </section>
        {result && (
          <section>
            <ResultCard result={result} />
          </section>
        )}
        <section>
          <History
            items={history}
            onLoad={(item) => {
              setResult(item.result);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onClear={() => setHistory([])}
          />
        </section>
      </main>

      <footer className="mt-10 text-center text-xs opacity-70">
        <p>
          Results are heuristic guidance only. Always verify via official sources.
        </p>
      </footer>
    </div>
  );
}
