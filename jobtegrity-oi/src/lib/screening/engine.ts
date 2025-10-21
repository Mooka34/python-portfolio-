import { JobInput, JobScreeningResult, RiskFactor } from "@/types/job";
import {
  extractDomain,
  isFreeEmailDomain,
  domainMatchesCompany,
  containsShortenedUrl,
  countAllCapsWords,
  countOccurrences,
  normalizeWhitespace,
} from "./textUtils";

const PHRASES_FEE = [
  "training fee",
  "application fee",
  "processing fee",
  "equipment fee",
  "shipping fee",
  "upfront fee",
  "pay a fee",
  "fee required",
  "deposit required",
];

const PHRASES_PAYMENT_SCAM = [
  "gift card",
  "giftcard",
  "apple pay",
  "google pay",
  "wire transfer",
  "western union",
  "moneygram",
  "crypto",
  "bitcoin",
  "ethereum",
  "cashier's check",
  "cashiers check",
  "check by mail",
];

const PHRASES_DATA_REQUEST = [
  "social security",
  "ssn",
  "bank account",
  "routing number",
  "credit card",
  "passport number",
  "driver's license",
  "drivers license",
];

const PHRASES_MESSENGERS = ["telegram", "whatsapp", "signal", "facebook messenger", "imessage"];

const PHRASES_TOO_GOOD = [
  "no experience required",
  "work from home immediately",
  "earn $$$",
  "quick money",
  "instant pay",
  "weekly pay guaranteed",
  "set your own hours and salary",
];

export function screenJob(job: JobInput): JobScreeningResult {
  const factors: RiskFactor[] = [];
  const description = normalizeWhitespace(job.description || "");

  // Email checks
  const emailDomain = extractDomain(job.contactEmail || undefined);
  if (emailDomain) {
    if (isFreeEmailDomain(emailDomain)) {
      factors.push({
        code: "free_email",
        label: "Contact email uses a free provider",
        severity: "medium",
        weight: 15,
        details: emailDomain,
      });
    }
    if (job.companyWebsite && !domainMatchesCompany(emailDomain, job.companyWebsite)) {
      factors.push({
        code: "domain_mismatch",
        label: "Email domain does not match company website",
        severity: "medium",
        weight: 15,
        details: `${emailDomain} vs ${job.companyWebsite}`,
      });
    }
  }

  // Links
  if (job.applicationLink && containsShortenedUrl(job.applicationLink)) {
    factors.push({
      code: "shortened_url",
      label: "Application link uses URL shortener",
      severity: "medium",
      weight: 10,
      details: job.applicationLink,
    });
  }
  if (containsShortenedUrl(description)) {
    factors.push({
      code: "shortened_url_desc",
      label: "Shortened URL detected in description",
      severity: "low",
      weight: 5,
    });
  }

  // Payment / fee requests (heavy)
  const feeMentions = countOccurrences(description, PHRASES_FEE);
  if (feeMentions > 0) {
    factors.push({
      code: "fee_request",
      label: "Mentions fees to apply or get equipment",
      severity: "high",
      weight: Math.min(40, 20 + feeMentions * 5),
    });
  }

  const paymentMentions = countOccurrences(description, PHRASES_PAYMENT_SCAM);
  if (paymentMentions > 0) {
    factors.push({
      code: "payment_methods",
      label: "Suspicious payment methods mentioned",
      severity: "high",
      weight: Math.min(40, 20 + paymentMentions * 5),
    });
  }

  const dataMentions = countOccurrences(description, PHRASES_DATA_REQUEST);
  if (dataMentions > 0) {
    factors.push({
      code: "sensitive_data",
      label: "Requests sensitive personal or financial data",
      severity: "high",
      weight: Math.min(40, 20 + dataMentions * 5),
    });
  }

  const messengerMentions = countOccurrences(description, PHRASES_MESSENGERS);
  if (messengerMentions > 0) {
    factors.push({
      code: "messenger_interview",
      label: "Interview via Telegram/WhatsApp/Signal",
      severity: "high",
      weight: Math.min(35, 15 + messengerMentions * 5),
    });
  }

  // Too-good-to-be-true phrasing
  const tooGood = countOccurrences(description, PHRASES_TOO_GOOD);
  if (tooGood > 0) {
    factors.push({
      code: "too_good",
      label: "Too-good-to-be-true claims",
      severity: "medium",
      weight: Math.min(15, 5 + tooGood * 3),
    });
  }

  // Exclamation and ALL CAPS heuristic
  const exclamations = (description.match(/!/g) || []).length;
  if (exclamations >= 5) {
    factors.push({
      code: "exclamations",
      label: "Excessive exclamation marks",
      severity: "low",
      weight: Math.min(10, Math.floor(exclamations / 2)),
    });
  }

  const capsWords = countAllCapsWords(description);
  if (capsWords >= 3) {
    factors.push({
      code: "all_caps",
      label: "Unprofessional ALL-CAPS wording",
      severity: "low",
      weight: Math.min(10, 2 + Math.floor(capsWords / 2)),
    });
  }

  // Salary plausibility (basic): high salary with "no experience" or "entry level"
  const mentionsNoExperience = /no experience|entry level/i.test(description);
  if (mentionsNoExperience && job.salaryMax && job.salaryMax >= 200000) {
    factors.push({
      code: "unrealistic_salary",
      label: "Unrealistic salary for entry-level wording",
      severity: "medium",
      weight: 15,
    });
  }

  // Positive signal: corporate email matches website
  if (emailDomain && domainMatchesCompany(emailDomain, job.companyWebsite)) {
    factors.push({
      code: "corp_email",
      label: "Corporate email matches company domain",
      severity: "low",
      weight: -10, // negative weight increases score
    });
  }

  // Aggregate score
  let score = 100;
  for (const f of factors) {
    score -= f.weight; // if negative, this will add
  }
  score = Math.max(0, Math.min(100, score));

  let riskLevel: JobScreeningResult["riskLevel"] = "Legit";
  if (score < 50) riskLevel = "High Risk";
  else if (score < 75) riskLevel = "Caution";

  const suggestions: string[] = [];
  if (factors.some((f) => f.code === "free_email" || f.code === "domain_mismatch")) {
    suggestions.push("Verify sender identity via official company site before responding.");
  }
  if (factors.some((f) => f.code === "fee_request")) {
    suggestions.push("Legitimate employers do not charge fees for equipment or applications.");
  }
  if (factors.some((f) => f.code === "payment_methods")) {
    suggestions.push("Avoid gift cards, crypto, or wire transfers for employment processes.");
  }
  if (factors.some((f) => f.code === "messenger_interview")) {
    suggestions.push("Be cautious with interviews conducted solely on messaging apps.");
  }
  if (factors.some((f) => f.code === "sensitive_data")) {
    suggestions.push("Never share SSN or banking details before a signed offer and onboarding.");
  }

  const summary = `${riskLevel} (${score}/100). ${factors.length} risk factor${factors.length === 1 ? "" : "s"} detected.`;

  return { score, riskLevel, factors, summary, suggestions };
}

export function quickScoreFromText(description: string): JobScreeningResult {
  return screenJob({
    title: "Untitled",
    companyName: "",
    description,
  });
}
