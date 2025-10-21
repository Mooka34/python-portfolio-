import re
from dataclasses import dataclass
from typing import Dict, Optional


_SCAM_KEYWORDS = [
    r"wire transfer", r"gift card", r"bitcoin", r"crypto", r"cryptocurrency",
    r"upfront fee", r"processing fee", r"training fee", r"deposit required",
    r"whatsapp", r"telegram", r"wechat", r"dm me", r"text .*\d{3}[- )]?\d{3}[- ]?\d{4}",
    r"gmail\.com|yahoo\.com|hotmail\.com|outlook\.com",
    r"urgent hiring", r"limited slots", r"no experience needed", r"work from home and earn",
    r"quick money", r"earn \$?\d{3,} per (day|week)", r"make money fast",
    r"visa sponsorship guaranteed", r"100% guaranteed",
    r"click here", r"signup now", r"verify your account",
]

_SUSPICIOUS_TITLES = [
    r"data entry (clerk|operator)", r"remote typist", r"proofreader (remote|from home)", r"packages handler from home",
]


def _sigmoid(x: float) -> float:
    if x >= 0:
        z = pow(2.718281828459045, -x)
        return 1.0 / (1.0 + z)
    z = pow(2.718281828459045, x)
    return z / (1.0 + z)


def _heuristic_score(title: str, description: str, salary: Optional[str], link: Optional[str]) -> float:
    text = f"{title}\n{description}\n{salary or ''}\n{link or ''}".lower()
    score = 0.0

    for pattern in _SCAM_KEYWORDS:
        if re.search(pattern, text):
            score += 1.0

    for pattern in _SUSPICIOUS_TITLES:
        if re.search(pattern, title.lower()):
            score += 0.8

    if re.search(r"\$\s?\d{3,}\s?/\s?(day|week)", text):
        score += 1.2
    if re.search(r"\$\s?\d{6,}", text):
        score += 0.8

    if re.search(r"\b\d{3}[- )]?\d{3}[- ]?\d{4}\b", text):
        score += 0.6
    if re.search(r"\b(?:gmail|yahoo|hotmail|outlook)\.com\b", text):
        score += 0.5

    if link and re.search(r"https?://(\w+\.)?(bit\.ly|tinyurl\.com|t\.co|goo\.gl|linktr\.ee)", (link or '').lower()):
        score += 0.7

    return _sigmoid(0.9 * score - 1.0)


def detect_fake_job(*, title: str, company: str, description: str,
                    salary: Optional[str] = None, location: Optional[str] = None, link: Optional[str] = None) -> Dict[str, object]:
    prob_fake = _heuristic_score(title=title, description=description, salary=salary, link=link)
    prob_real = 1.0 - prob_fake
    label = "fake" if prob_fake >= 0.5 else "real"
    return {
        "label": label,
        "confidence": max(prob_fake, prob_real),
        "scores": {"fake": prob_fake, "real": prob_real},
    }
