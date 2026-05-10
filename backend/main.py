import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from models import OptimizeRequest, OptimizeResponse
from optimizer import compute_match_score, optimize
from pdf_utils import extract_text_from_pdf, fetch_jd_from_url, generate_resume_pdf

load_dotenv()

ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT / "frontend" / "dist"

app = FastAPI(title="OfferForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")


@api.post("/optimize", response_model=OptimizeResponse)
async def optimize_endpoint(req: OptimizeRequest):
    if not req.resume.strip():
        raise HTTPException(status_code=400, detail="Resume cannot be empty.")
    if not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    optimized, missing = _optimize_safe(req.resume, req.job_description)
    score = compute_match_score(optimized, req.job_description)

    return OptimizeResponse(
        optimized_resume=optimized,
        match_score=score,
        missing_keywords=missing,
    )


@api.post("/optimize/upload", response_model=OptimizeResponse)
async def optimize_upload(
    resume_text: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None),
    jd_url: Optional[str] = Form(None),
):
    if resume_file:
        content = await resume_file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")
        try:
            resume = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not read PDF: {e}")
        if not resume.strip():
            raise HTTPException(status_code=422, detail="No text found in PDF. Is it a scanned image?")
    elif resume_text and resume_text.strip():
        resume = resume_text
    else:
        raise HTTPException(status_code=400, detail="Provide resume_file or resume_text.")

    if jd_url and jd_url.strip():
        try:
            jd = fetch_jd_from_url(jd_url.strip())
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not fetch job URL: {e}")
        if not jd.strip():
            raise HTTPException(status_code=422, detail="Job URL returned no readable content.")
    elif jd_text and jd_text.strip():
        jd = jd_text
    else:
        raise HTTPException(status_code=400, detail="Provide jd_url or jd_text.")

    optimized, missing = _optimize_safe(resume, jd)
    score = compute_match_score(optimized, jd)

    return OptimizeResponse(
        optimized_resume=optimized,
        match_score=score,
        missing_keywords=missing,
    )


class PdfRequest(BaseModel):
    text: str


@api.post("/pdf")
async def download_pdf(req: PdfRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        pdf_bytes = generate_resume_pdf(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="optimized-resume.pdf"'},
    )


app.include_router(api)


def _optimize_safe(resume: str, jd: str):
    """Optimize with a clear HTTP error when LLM is not configured."""
    try:
        return optimize(resume, jd)
    except RuntimeError as e:
        msg = str(e)
        if "OPENROUTER" in msg.upper():
            raise HTTPException(status_code=503, detail=msg) from e
        raise


@app.get("/health")
def health():
    return {"status": "ok"}


if DIST_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="spa")
