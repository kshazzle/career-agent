import json
import os
import re
from typing import List, Set, Tuple
from openai import OpenAI

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "do",
    "for", "from", "have", "he", "her", "him", "his", "how", "i", "if",
    "in", "is", "it", "its", "me", "my", "no", "not", "of", "on", "or",
    "our", "out", "she", "so", "than", "that", "the", "their", "them",
    "then", "there", "they", "this", "to", "up", "us", "was", "we",
    "were", "what", "when", "who", "will", "with", "you", "your",
}

_client = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.environ["OPENROUTER_API_KEY"],
        )
    return _client


def _token_set(text: str) -> Set[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.\-]*", text.lower())
    return {t for t in tokens if t not in STOPWORDS and len(t) > 2}


def compute_match_score(resume: str, job_description: str) -> int:
    resume_kw = _token_set(resume)
    jd_kw = _token_set(job_description)
    if not jd_kw:
        return 0
    overlap = len(resume_kw & jd_kw)
    return min(int((overlap / len(jd_kw)) * 100), 100)


def optimize(resume: str, job_description: str) -> Tuple[str, List[str]]:
    """Single LLM call: rewrite resume + extract meaningful missing keywords."""
    model = os.getenv("OPENROUTER_MODEL", "google/gemma-3-27b-it:free")

    system_prompt = """You are an expert resume writer and ATS optimization specialist.

Given a resume and a job description, return a JSON object with EXACTLY two keys:
1. "optimized_resume": the rewritten resume as a plain-text string.
2. "missing_keywords": a JSON array of 5-12 specific technical skills, tools, frameworks, or domain concepts that are explicitly required or preferred in the job description but absent from the original resume.

STRICT OUTPUT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations, no text before or after JSON.

MISSING KEYWORDS RULES:
- Include only meaningful, role-relevant terms (e.g. "Kafka", "CI/CD", "access management", "fault-tolerant systems").
- Do NOT include generic words like "experience", "team", "role", "candidate", or soft skills.

RESUME OPTIMIZATION RULES:
- Preserve ALL factual details. Do NOT invent metrics, roles, or technologies.
- Keep the original section structure (e.g. Experience, Projects, Skills).
- Use bullet points for experience sections. Do NOT convert into paragraphs.
- Use strong action verbs (engineered, built, optimized, led, designed, delivered).
- Improve clarity and conciseness. Remove redundant or weak phrasing.
- Quantify impact ONLY if it is already supported by the original content.
- Integrate relevant job description keywords naturally into existing bullet points.
- Avoid keyword stuffing. The resume should still read naturally.
- Keep length similar to original (+/-10-15%). Do NOT significantly expand or shrink.

QUALITY BAR:
- The final resume should read like a top 10-15% candidate for this role.
- Focus on impact, ownership, and measurable contributions.

Return ONLY the JSON object."""

    user_prompt = (
        f"JOB DESCRIPTION:\n{job_description}\n\n"
        f"ORIGINAL RESUME:\n{resume}"
    )

    response = get_client().chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=4000,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if the model wraps output in ```json ... ```
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw.strip())

    parsed = json.loads(raw)
    optimized_resume = parsed["optimized_resume"]
    missing_keywords = parsed.get("missing_keywords", [])

    return optimized_resume, missing_keywords
