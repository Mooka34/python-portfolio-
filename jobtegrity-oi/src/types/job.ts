export type RiskSeverity = "low" | "medium" | "high";

export interface JobInput {
  title: string;
  companyName: string;
  companyWebsite?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string; // e.g. USD, EUR
  jobType?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary" | "Volunteer" | "Other";
  workMode?: "On-site" | "Remote" | "Hybrid";
  contactEmail?: string;
  applicationLink?: string;
  description: string;
  source?: string;
  postedAt?: string; // ISO date string
}

export interface RiskFactor {
  code: string;
  label: string;
  severity: RiskSeverity;
  weight: number; // points to subtract from score (positive => subtract)
  details?: string;
}

export interface JobScreeningResult {
  score: number; // 0-100 higher is safer
  riskLevel: "Legit" | "Caution" | "High Risk";
  factors: RiskFactor[];
  summary: string;
  suggestions: string[];
}
