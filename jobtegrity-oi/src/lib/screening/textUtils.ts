const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "mail.com",
  "yandex.com",
]);

const SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "is.gd",
  "rebrand.ly",
  "cutt.ly",
  "ow.ly",
  "buff.ly",
];

export function extractDomain(urlOrEmail: string | undefined | null): string | null {
  if (!urlOrEmail) return null;
  const value = urlOrEmail.trim().toLowerCase();
  // Email
  const at = value.indexOf("@");
  if (at > -1 && at < value.length - 1) {
    return value.slice(at + 1);
  }
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isFreeEmailDomain(domain: string | null): boolean {
  if (!domain) return false;
  return FREE_EMAIL_DOMAINS.has(domain);
}

export function domainMatchesCompany(emailDomain: string | null, companyWebsite: string | undefined): boolean {
  if (!emailDomain || !companyWebsite) return false;
  const companyDomain = extractDomain(companyWebsite);
  if (!companyDomain) return false;
  return emailDomain === companyDomain || emailDomain.endsWith(`.${companyDomain}`);
}

export function containsShortenedUrl(text: string): boolean {
  const lower = text.toLowerCase();
  return SHORTENERS.some((d) => lower.includes(d));
}

export function countAllCapsWords(text: string): number {
  const tokens = text.split(/[^A-Za-z]+/).filter(Boolean);
  return tokens.filter((t) => t.length >= 4 && t === t.toUpperCase()).length;
}

export function countOccurrences(text: string, patterns: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const p of patterns) {
    const re = new RegExp(p, "gi");
    const matches = lower.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
