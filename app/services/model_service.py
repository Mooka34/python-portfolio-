from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
from typing import Tuple


MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "fake_job_model.pkl"


_SCAM_KEYWORDS = [
    # payment and fees
    r"wire transfer", r"gift card", r"bitcoin", r"crypto", r"cryptocurrency",
    r"upfront fee", r"processing fee", r"training fee", r"deposit required",
    # messaging apps and shady contact
    r"whatsapp", r"telegram", r"wechat", r"dm me", r"text .*\d{3}[- )]?\d{3}[- ]?\d{4}",
    r"gmail\.com|yahoo\.com|hotmail\.com|outlook\.com",
    # urgency and unrealistic claims
    r"urgent hiring", r"limited slots", r"no experience needed", r"work from home and earn",
    r"quick money", r"earn \$?\d{3,} per (day|week)", r"make money fast",
    # visa and legal guarantees
    r"visa sponsorship guaranteed", r"100% guaranteed",
    # link bait
    r"click here", r"signup now", r"verify your account",
]

_SUSPICIOUS_TITLES = [
    r"data entry (clerk|operator)", r"remote typist", r"proofreader (remote|from home)", r"packages handler from home",
]


@dataclass
class ModelPrediction:
    prob_fake: float
    prob_real: float


class FakeJobDetector:
    def __init__(self) -> None:
        self._model = None
        self._model_loaded = False

    def _try_load_model(self) -> None:
        if self._model_loaded:
            return
        self._model_loaded = True
        if not MODEL_PATH.exists():
            return
        try:
            # Import lazily to avoid hard dependency if user does not train
            import joblib  # type: ignore
            # scikit-learn classes are needed to unpickle the pipeline
            import sklearn  # noqa: F401  # type: ignore
            self._model = joblib.load(MODEL_PATH)
        except Exception:
            # Fall back to heuristics if loading fails for any reason
            self._model = None

    @staticmethod
    def _combine_fields(title: str, company: str, description: str,
                        salary: str | None, location: str | None, link: str | None) -> str:
        parts = [
            f"title: {title}",
            f"company: {company}",
            f"description: {description}",
        ]
        if salary:
            parts.append(f"salary: {salary}")
        if location:
            parts.append(f"location: {location}")
        if link:
            parts.append(f"link: {link}")
        return "\n".join(parts)

    @staticmethod
    def _sigmoid(x: float) -> float:
        # Simple and numerically safe enough for our score ranges
        if x >= 0:
            z = pow(2.718281828459045, -x)
            return 1.0 / (1.0 + z)
        z = pow(2.718281828459045, x)
        return z / (1.0 + z)

    @staticmethod
    def _heuristic_score(title: str, description: str, salary: str | None, link: str | None) -> float:
        text = f"{title}\n{description}\n{salary or ''}\n{link or ''}".lower()
        score = 0.0

        # Keyword matches
        for pattern in _SCAM_KEYWORDS:
            if re.search(pattern, text):
                score += 1.0

        for pattern in _SUSPICIOUS_TITLES:
            if re.search(pattern, title.lower()):
                score += 0.8

        # Unrealistic salary claims
        if re.search(r"\$\s?\d{3,}\s?/\s?(day|week)", text):
            score += 1.2
        if re.search(r"\$\s?\d{6,}", text):
            score += 0.8

        # Raw contact details in description
        if re.search(r"\b\d{3}[- )]?\d{3}[- ]?\d{4}\b", text):
            score += 0.6
        if re.search(r"\b(?:gmail|yahoo|hotmail|outlook)\.com\b", text):
            score += 0.5

        # Link without company domain (very rough heuristic)
        if link and re.search(r"https?://(\w+\.)?(bit\.ly|tinyurl\.com|t\.co|goo\.gl|linktr\.ee)", link.lower()):
            score += 0.7

        # Map score to probability via logistic
        return FakeJobDetector._sigmoid(0.9 * score - 1.0)

    def predict(self, *, title: str, company: str, description: str,
                salary: str | None = None, location: str | None = None, link: str | None = None) -> ModelPrediction:
        self._try_load_model()
        if self._model is not None:
            combined = self._combine_fields(title, company, description, salary, location, link)
            try:
                # Expecting a sklearn Pipeline with predict_proba
                proba = self._model.predict_proba([combined])[0]
                # Convention: proba order [class0, class1]; assume classes_[1] is "fake" if present
                # To be robust, try to detect label mapping
                prob_fake = None
                try:
                    classes = list(getattr(self._model, "classes_", []))
                    if classes and "fake" in classes:
                        fake_index = classes.index("fake")
                        prob_fake = float(proba[fake_index])
                except Exception:
                    prob_fake = None
                if prob_fake is None:
                    # Fallback: assume index 1 corresponds to positive/fake
                    prob_fake = float(proba[1]) if len(proba) > 1 else float(proba[0])
                prob_real = 1.0 - prob_fake
                return ModelPrediction(prob_fake=prob_fake, prob_real=prob_real)
            except Exception:
                # If model inference fails, fall back to heuristics
                pass

        prob_fake = self._heuristic_score(title=title, description=description, salary=salary, link=link)
        prob_real = 1.0 - prob_fake
        return ModelPrediction(prob_fake=prob_fake, prob_real=prob_real)


# Singleton detector to avoid reloading in server
_detector_singleton: FakeJobDetector | None = None


def get_detector() -> FakeJobDetector:
    global _detector_singleton
    if _detector_singleton is None:
        _detector_singleton = FakeJobDetector()
    return _detector_singleton
