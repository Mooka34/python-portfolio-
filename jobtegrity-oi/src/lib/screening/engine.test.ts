import { describe, it, expect } from "vitest";
import { screenJob, quickScoreFromText } from "./engine";

describe("screenJob", () => {
  it("flags fee requests and sets high risk", () => {
    const r = quickScoreFromText("There is a training fee and equipment fee. Pay by gift card.");
    expect(r.riskLevel).toBe("High Risk");
    expect(r.factors.some((f) => f.code === "fee_request")).toBe(true);
    expect(r.factors.some((f) => f.code === "payment_methods")).toBe(true);
  });

  it("rewards corporate email domain match", () => {
    const r = screenJob({
      title: "Engineer",
      companyName: "Acme",
      companyWebsite: "https://acme.com",
      contactEmail: "hiring@acme.com",
      description: "Standard job post",
    });
    expect(r.score).toBeGreaterThan(80);
    expect(r.factors.some((f) => f.code === "corp_email")).toBe(true);
  });

  it("penalizes messenger-only interview mentions", () => {
    const r = quickScoreFromText("Interview via Telegram or WhatsApp. Contact us on Signal!");
    expect(r.factors.some((f) => f.code === "messenger_interview")).toBe(true);
  });
});
