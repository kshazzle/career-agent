import io
import pathlib
import re

import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader

_JD_SELECTORS = [
    '[data-testid="job-description"]',
    '[data-testid="jobDescriptionText"]',
    ".job-description",
    "#job-description",
    ".description__text",
    '[class*="jobDescription"]',
    '[class*="job-desc"]',
    '[id*="job-desc"]',
    "article",
    "main",
]

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

_FONTS_REGISTERED = False
_FONT_NORMAL = "Helvetica"
_FONT_BOLD = "Helvetica-Bold"


def _register_fonts():
    global _FONTS_REGISTERED, _FONT_NORMAL, _FONT_BOLD
    if _FONTS_REGISTERED:
        return
    try:
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.pdfbase.pdfmetrics import registerFontFamily
        import fpdf as _fp

        fd = pathlib.Path(_fp.__file__).parent / "fonts"
        pdfmetrics.registerFont(TTFont("RN", str(fd / "DejaVuSans.ttf")))
        pdfmetrics.registerFont(TTFont("RB", str(fd / "DejaVuSans-Bold.ttf")))
        pdfmetrics.registerFont(TTFont("RI", str(fd / "DejaVuSans-Oblique.ttf")))
        registerFontFamily("RN", normal="RN", bold="RB", italic="RI", boldItalic="RB")
        _FONT_NORMAL = "RN"
        _FONT_BOLD = "RB"
    except Exception:
        pass
    _FONTS_REGISTERED = True


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts).strip()


def fetch_jd_from_url(url: str) -> str:
    with httpx.Client(follow_redirects=True, timeout=20, headers=_HEADERS) as client:
        resp = client.get(url)
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    for tag in soup(["script", "style", "nav", "header", "footer", "aside", "iframe"]):
        tag.decompose()

    container = None
    for selector in _JD_SELECTORS:
        container = soup.select_one(selector)
        if container:
            break

    text = (container or soup).get_text(separator="\n")
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return "\n".join(lines)[:10000]


# ── Resume structure helpers ──────────────────────────────────────────────────

def _is_section_header(line: str) -> bool:
    """ALL-CAPS short line (no lowercase letters, no year, no bullet prefix)."""
    s = line.strip()
    if not s or len(s) > 60:
        return False
    if s[0] in ("•", "-", "*", "+", "|"):
        return False
    if re.search(r"\b(19|20)\d{2}\b", s):
        return False
    alpha = re.sub(r"[^a-zA-Z]", "", s)
    return bool(alpha) and not any(c.islower() for c in alpha)


def _is_job_header(line: str) -> bool:
    """Line with a year + pipe/dash separator → company/role/date row."""
    s = line.strip()
    if not s or _is_section_header(s):
        return False
    if s[0] in ("•", "-", "*"):
        return False
    return bool(re.search(r"\b(19|20)\d{2}\b", s)) and bool(re.search(r"[|—–]", s))


def _is_bullet(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    return s[0] in ("•", "◦") or s.startswith(("- ", "* ", "+ "))


def _xml(text: str) -> str:
    """Escape XML special characters for use inside Paragraph markup."""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ── PDF generation ────────────────────────────────────────────────────────────

def generate_resume_pdf(text: str) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
        Table, TableStyle,
    )
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_JUSTIFY

    _register_fonts()
    NF, BF = _FONT_NORMAL, _FONT_BOLD

    LM = RM = 15 * mm
    TM = BM = 12 * mm
    TW = A4[0] - LM - RM  # usable text width in points

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=LM, rightMargin=RM,
        topMargin=TM, bottomMargin=BM,
    )

    # ── Paragraph styles ──────────────────────────────────────────────────────
    S_NAME    = ParagraphStyle("name",    fontName=BF, fontSize=16,  leading=19,   spaceAfter=1,   alignment=TA_CENTER)
    S_CONTACT = ParagraphStyle("contact", fontName=NF, fontSize=9,   leading=11,   spaceAfter=6,   alignment=TA_CENTER)
    S_SECTION = ParagraphStyle("section", fontName=BF, fontSize=9,   leading=10,   spaceAfter=2)
    S_JL      = ParagraphStyle("jl",      fontName=NF, fontSize=8.5, leading=10.5, spaceAfter=0)
    S_JR      = ParagraphStyle("jr",      fontName=NF, fontSize=8,   leading=10.5, spaceAfter=0,
                                alignment=TA_RIGHT, textColor=colors.HexColor("#444444"))
    S_BULLET  = ParagraphStyle("bullet",  fontName=NF, fontSize=8,   leading=10,   spaceAfter=0.5,
                                leftIndent=10, firstLineIndent=-9, alignment=TA_JUSTIFY)
    S_NORMAL  = ParagraphStyle("normal",  fontName=NF, fontSize=8,   leading=10,   spaceAfter=1,
                                alignment=TA_JUSTIFY)

    # ── Build story ───────────────────────────────────────────────────────────
    story = []
    header_done = False
    header_lines_seen = 0

    for raw in text.split("\n"):
        s = raw.strip()

        # ── Header region: first line = name, second = contact ────────────────
        if not header_done:
            if not s:
                if header_lines_seen > 0:
                    header_done = True
                continue
            header_lines_seen += 1
            if header_lines_seen == 1:
                story.append(Paragraph(_xml(s), S_NAME))
                continue
            if not _is_section_header(s):
                story.append(Paragraph(_xml(s), S_CONTACT))
                continue
            # Section header immediately after name → end of header region
            header_done = True
            # fall through to process this line as body

        # ── Body ──────────────────────────────────────────────────────────────
        if not s:
            story.append(Spacer(1, 1.5))
            continue

        if _is_section_header(s):
            story.append(Spacer(1, 4))
            story.append(Paragraph(_xml(s), S_SECTION))
            story.append(HRFlowable(
                width="100%", thickness=0.4,
                color=colors.black, spaceAfter=2,
            ))

        elif _is_job_header(s):
            # Split "Company — Role | StartDate — EndDate"
            # on the first pipe to separate the left (company/role) from right (dates)
            parts = s.split("|", 1)
            left_raw  = parts[0].strip()
            right_raw = parts[1].strip() if len(parts) > 1 else ""

            # Bold the company/institution (text before em/en dash)
            dash_parts = re.split(r"\s[—–]\s", left_raw, 1)
            if len(dash_parts) == 2:
                left_markup = f"<b>{_xml(dash_parts[0])}</b> — {_xml(dash_parts[1])}"
            else:
                left_markup = f"<b>{_xml(left_raw)}</b>"

            if right_raw:
                tbl = Table(
                    [[Paragraph(left_markup, S_JL),
                      Paragraph(_xml(right_raw), S_JR)]],
                    colWidths=[TW * 0.62, TW * 0.38],
                    hAlign="LEFT",
                )
                tbl.setStyle(TableStyle([
                    ("VALIGN",        (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING",   (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
                    ("TOPPADDING",    (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ]))
                story.append(tbl)
            else:
                story.append(Paragraph(left_markup, S_JL))

        elif _is_bullet(s):
            content = re.sub(r"^[•◦\-\*\+]\s*", "", s)
            story.append(Paragraph("• " + _xml(content), S_BULLET))

        else:
            story.append(Paragraph(_xml(s), S_NORMAL))

    doc.build(story)
    return buf.getvalue()
