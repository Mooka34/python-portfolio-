from __future__ import annotations

import argparse
from pathlib import Path
import json

import joblib  # type: ignore
import pandas as pd  # type: ignore
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.pipeline import Pipeline  # type: ignore
from sklearn.linear_model import LogisticRegression  # type: ignore
from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.metrics import classification_report  # type: ignore

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "fake_jobs_sample.jsonl"
MODEL_PATH = ROOT / "models" / "fake_job_model.pkl"
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)


def build_pipeline() -> Pipeline:
    return Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2)) ),
        ("clf", LogisticRegression(max_iter=200))
    ])


def load_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise SystemExit(f"Dataset not found at {DATA_PATH}. Provide a JSONL with fields: title, company, description, label")
    rows = []
    with DATA_PATH.open() as f:
        for line in f:
            obj = json.loads(line)
            text = f"title: {obj.get('title','')}\ncompany: {obj.get('company','')}\ndescription: {obj.get('description','')}\n"
            rows.append({"text": text, "label": obj["label"]})
    return pd.DataFrame(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--test-size", type=float, default=0.2)
    args = parser.parse_args()

    df = load_data()
    X_train, X_test, y_train, y_test = train_test_split(df["text"], df["label"], test_size=args.test_size, random_state=42, stratify=df["label"])

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    print(classification_report(y_test, y_pred))

    joblib.dump(pipe, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
