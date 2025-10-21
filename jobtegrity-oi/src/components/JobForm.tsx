"use client";

import { useState } from "react";
import { JobInput } from "@/types/job";

const DEFAULT: JobInput = {
  title: "Customer Support Assistant",
  companyName: "Acme Corp",
  companyWebsite: "https://acme.example",
  location: "Remote",
  salaryMin: 45000,
  salaryMax: 65000,
  currency: "USD",
  jobType: "Full-time",
  workMode: "Remote",
  contactEmail: "hiring@acme.example",
  applicationLink: "https://acme.example/careers/123",
  description:
    "We are hiring a remote support assistant. No experience required. Interview via WhatsApp. Provide bank account for direct deposit before start.",
  source: "Sample",
};

export default function JobForm({ onAnalyze }: { onAnalyze: (job: JobInput) => void }) {
  const [job, setJob] = useState<JobInput>(DEFAULT);

  function update<K extends keyof JobInput>(key: K, value: JobInput[K]) {
    setJob((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!job.title || !job.companyName || !job.description) return;
    onAnalyze(job);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Job title</label>
        <input
          className="border rounded-md px-3 py-2"
          value={job.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Software Engineer"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Company name</label>
        <input
          className="border rounded-md px-3 py-2"
          value={job.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          placeholder="e.g. Jobtegrity, Inc."
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Company website</label>
        <input
          className="border rounded-md px-3 py-2"
          value={job.companyWebsite || ""}
          onChange={(e) => update("companyWebsite", e.target.value)}
          placeholder="https://company.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Contact email</label>
        <input
          className="border rounded-md px-3 py-2"
          value={job.contactEmail || ""}
          onChange={(e) => update("contactEmail", e.target.value)}
          placeholder="recruiter@company.com"
          type="email"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Application link</label>
        <input
          className="border rounded-md px-3 py-2"
          value={job.applicationLink || ""}
          onChange={(e) => update("applicationLink", e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Location</label>
        <input
          className="border rounded-md px-3 py-2"
          value={job.location || ""}
          onChange={(e) => update("location", e.target.value)}
          placeholder="City, Country or Remote"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Salary range</label>
        <div className="flex gap-2">
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={job.salaryMin ?? ""}
            onChange={(e) => update("salaryMin", Number(e.target.value) || undefined)}
            placeholder="Min"
            type="number"
            min={0}
          />
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={job.salaryMax ?? ""}
            onChange={(e) => update("salaryMax", Number(e.target.value) || undefined)}
            placeholder="Max"
            type="number"
            min={0}
          />
          <input
            className="border rounded-md px-3 py-2 w-28"
            value={job.currency || "USD"}
            onChange={(e) => update("currency", e.target.value)}
            placeholder="Currency"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Job type</label>
        <select
          className="border rounded-md px-3 py-2"
          value={job.jobType || "Full-time"}
          onChange={(e) => update("jobType", e.target.value as JobInput["jobType"])}
        >
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Internship</option>
          <option>Temporary</option>
          <option>Volunteer</option>
          <option>Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Work mode</label>
        <select
          className="border rounded-md px-3 py-2"
          value={job.workMode || "Remote"}
          onChange={(e) => update("workMode", e.target.value as JobInput["workMode"])}
        >
          <option>On-site</option>
          <option>Remote</option>
          <option>Hybrid</option>
        </select>
      </div>

      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="text-sm font-medium">Job description</label>
        <textarea
          className="border rounded-md px-3 py-2 min-h-40"
          value={job.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Paste the full job description, email, or message here"
          required
        />
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-2">
        <button type="button" className="px-4 py-2 rounded-md border" onClick={() => setJob(DEFAULT)}>
          Reset
        </button>
        <button type="submit" className="px-4 py-2 rounded-md bg-foreground text-background font-medium">
          Analyze
        </button>
      </div>
    </form>
  );
}
