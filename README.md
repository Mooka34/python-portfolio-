# Fake Job Posting Detector

A FastAPI backend with a simple ML classifier and a responsive PWA frontend that predicts whether a job posting is likely fake or real. Works on web and installs as a PWA on iOS/Android. You can also wrap it with Capacitor/Expo later for native app stores.

## Quick start

1. Ensure Python 3.10+ is installed.
2. Install dependencies (runtime only):

```bash
pip3 install -r requirements.txt
```

3. Run the server:

```bash
python3 -m uvicorn app.main:app --reload --port 8000
```

4. Visit `http://localhost:8000`.

## Training a model (optional)

Provide a dataset at `data/fake_jobs_sample.jsonl` with one JSON object per line:

```json
{"title":"...","company":"...","description":"...","label":"fake"}
{"title":"...","company":"...","description":"...","label":"real"}
```

Then install training extras and run:

```bash
pip3 install -r requirements-train.txt
python3 scripts/train.py
```

The server autoloads the model from `models/fake_job_model.pkl`. If not present, a heuristic detector is used.

## API

- POST `/api/predict`

Request body:

```json
{
  "title": "Senior Backend Engineer",
  "company": "Acme Corp",
  "description": "...",
  "salary": "$180k-$210k",
  "location": "Remote",
  "link": "https://acme.com/careers/123"
}
```

Response:

```json
{
  "label": "real",
  "confidence": 0.93,
  "scores": { "fake": 0.07, "real": 0.93 }
}
```

## Mobile

This web app is installable as a PWA on iOS and Android from the browser. For app store distribution, wrap the web app using Capacitor (WebView) or build a React Native/Expo client that calls the same API.
