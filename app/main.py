from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.schemas import JobPostingInput, PredictionResponse, HealthResponse
from app.services.model_service import get_detector

app = FastAPI(title="Fake Job Posting Detector", version="0.1.0")

# Static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")


@app.post("/api/predict", response_model=PredictionResponse)
async def predict(payload: JobPostingInput) -> PredictionResponse:
    detector = get_detector()
    pred = detector.predict(
        title=payload.title,
        company=payload.company,
        description=payload.description,
        salary=payload.salary,
        location=payload.location,
        link=payload.link,
    )
    scores = {"fake": pred.prob_fake, "real": pred.prob_real}
    label = "fake" if pred.prob_fake >= 0.5 else "real"
    return PredictionResponse(label=label, confidence=max(scores.values()), scores=scores)


# PWA files routes (must be at root scope)
@app.get("/manifest.webmanifest")
async def manifest():
    return FileResponse("templates/manifest.webmanifest", media_type="application/manifest+json")


@app.get("/service-worker.js")
async def service_worker():
    return FileResponse("templates/service-worker.js", media_type="application/javascript")
