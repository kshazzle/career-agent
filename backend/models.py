from pydantic import BaseModel
from typing import List


class OptimizeRequest(BaseModel):
    resume: str
    job_description: str


class OptimizeResponse(BaseModel):
    optimized_resume: str
    match_score: int
    missing_keywords: List[str]
