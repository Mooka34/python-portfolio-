from pydantic import BaseModel, Field
from typing import Optional, Dict


class JobPostingInput(BaseModel):
    title: str = Field(..., min_length=1)
    company: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    salary: Optional[str] = None
    location: Optional[str] = None
    link: Optional[str] = None


class PredictionResponse(BaseModel):
    label: str
    confidence: float
    scores: Dict[str, float]


class HealthResponse(BaseModel):
    status: str
